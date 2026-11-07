/**
 * 前端版本更新检测模块
 *
 * 用于解决前端重新部署后用户浏览器仍停留在旧版本页面的问题
 *
 * ## 主要功能
 *
 * - 以服务端 `version.json` 中的版本号作为唯一版本标识
 * - 路由切换、页面切回前台、定时轮询时比对本地缓存版本号
 * - 检测到新版本时弹窗展示更新内容，可立即刷新或稍后处理
 * - `forceUpdate` 为 true 时只保留「立即刷新」，用户无法跳过
 * - 懒加载路由文件失效（新版本覆盖旧文件）时自动刷新兜底
 *
 * 请求失败、响应无法解析或未登录时一律静默跳过，不做任何提示
 *
 * @module utils/sys/version-check
 * @author Elysia Admin Team
 */
import { ElMessageBox } from 'element-plus'
import type { Router } from 'vue-router'
import { $t } from '@/locales'

/** 两次检测之间的最小间隔（毫秒） */
const CHECK_INTERVAL = 60 * 1000

/** 本地缓存的当前版本号 */
const APP_VERSION_KEY = 'sys-app-version'

/** 本次会话中用户选择「稍后」忽略的版本号 */
const IGNORED_KEY = 'sys-version-ignored'

/** 因懒加载文件缺失而自动刷新过的标记 */
const CHUNK_RELOAD_KEY = 'sys-chunk-reloading'

/** 懒加载模块请求失败的错误特征 */
const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i

let lastCheckAt = 0
let checking = false
let prompting = false

/**
 * 读取本地缓存的版本号
 * @returns 缓存的版本号，未缓存时为空串
 */
function readCachedVersion(): string {
  return localStorage.getItem(APP_VERSION_KEY) || ''
}

/**
 * 写入本地缓存的版本号
 * @param version 版本号
 */
function writeCachedVersion(version: string): void {
  localStorage.setItem(APP_VERSION_KEY, version)
}

/**
 * 判断当前是否处于可检测状态（已登录且不在登录页）
 * 延迟导入 store，避免 router → version-check → store → router 的循环依赖
 * @param router 路由实例
 * @returns 是否允许发起检测
 */
async function canCheck(router: Router): Promise<boolean> {
  if (router.currentRoute.value.name === 'Login') return false
  const { useUserStore } = await import('@/store/modules/user')
  return useUserStore().isLogin
}

/**
 * 构建更新弹窗的正文 HTML
 * @param item 版本条目
 * @returns 可直接用于 dangerouslyUseHTMLString 的 HTML 字符串
 */
function buildMessageHtml(item: Api.SystemVersion.VersionItem): string {
  const head = [
    `<div style="font-size: 14px; font-weight: 500; color: var(--art-gray-800);">${item.title}</div>`,
    `<div style="font-size: 12px; color: var(--art-gray-500); margin-top: 4px;">${item.releaseTime}</div>`
  ].join('')
  return [
    head,
    `<div style="margin-top: 10px; line-height: 1.8; color: var(--art-gray-800);">${item.content}</div>`
  ].join('')
}

/**
 * 弹出更新提示
 * 强制更新时只提供「立即刷新」且不可关闭；否则允许稍后处理
 * @param remote 服务端最新版本条目
 */
async function promptUpdate(remote: Api.SystemVersion.VersionItem): Promise<void> {
  prompting = true

  try {
    await ElMessageBox.confirm(
      buildMessageHtml(remote),
      `${$t('version.newVersionTitle')} v${remote.version}`,
      {
        confirmButtonText: $t('version.refreshNow'),
        cancelButtonText: $t('version.later'),
        type: 'info',
        dangerouslyUseHTMLString: true,
        showCancelButton: !remote.forceUpdate,
        closeOnClickModal: !remote.forceUpdate,
        closeOnPressEscape: !remote.forceUpdate,
        showClose: !remote.forceUpdate
      }
    )
    writeCachedVersion(remote.version)
    window.location.reload()
  } catch {
    // 用户选择稍后，本次会话内不再对该版本重复提示
    if (remote.forceUpdate) return
    sessionStorage.setItem(IGNORED_KEY, remote.version)
  } finally {
    prompting = false
  }
}

/**
 * 检测是否存在新版本
 *
 * 处理流程：
 * 1. 校验并发、检测间隔与登录状态
 * 2. 拉取服务端最新版本信息
 * 3. 首次运行直接记录版本号；版本号一致时不提示
 * 4. 版本号不一致且本会话未忽略时弹窗提示
 *
 * @param router 路由实例
 * @param force 是否忽略检测间隔限制
 */
export async function checkAppVersion(router: Router, force = false): Promise<void> {
  if (checking || prompting) return
  if (!force && Date.now() - lastCheckAt < CHECK_INTERVAL) return

  checking = true

  try {
    if (!(await canCheck(router))) return

    // 延迟导入，避免 version-check（被 router 引用）与 http 层形成循环依赖
    const { fetchGetVersionInfo } = await import('@/api/system/version')
    const data = await fetchGetVersionInfo()
    const remote = data?.current
    if (!remote?.version) return

    const cached = readCachedVersion()
    if (!cached) {
      writeCachedVersion(remote.version)
      return
    }
    if (cached === remote.version) return
    if (!remote.forceUpdate && sessionStorage.getItem(IGNORED_KEY) === remote.version) return

    await promptUpdate(remote)
  } catch {
    // 断网、服务不可用或响应无法解析时静默跳过
  } finally {
    lastCheckAt = Date.now()
    checking = false
  }
}

/**
 * 处理路由懒加载失败
 *
 * 新版本部署后旧的 chunk 文件已被覆盖，停留在旧页面的用户跳转未加载过的
 * 路由时会请求到不存在的文件并白屏，此时自动刷新拉取新版本
 *
 * @param error 路由抛出的错误
 */
function handleRouterError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  if (!CHUNK_ERROR_PATTERN.test(message)) return
  // 刷新后仍然失败说明并非版本问题，避免反复刷新
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return

  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
  window.location.reload()
}

/**
 * 初始化版本检测
 *
 * 检测时机：路由切换、页面从后台切回前台、定时轮询（均受最小间隔限制）
 *
 * @param router 路由实例
 */
export function setupVersionCheck(router: Router): void {
  router.onError(handleRouterError)
  router.afterEach(() => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    void checkAppVersion(router)
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkAppVersion(router)
  })

  setInterval(() => {
    void checkAppVersion(router)
  }, CHECK_INTERVAL)
}
