/**
 * 前端版本更新检测模块
 *
 * 用于解决前端重新部署后，用户浏览器仍停留在旧版本页面的问题
 *
 * ## 主要功能
 *
 * - 以打包产物（assets 下带 hash 的 js / css）作为版本指纹，无需手动维护版本号
 * - 定期拉取服务端最新的 index.html 与本地指纹比对
 * - 检测到新版本时提示用户刷新，用户可选择稍后处理
 * - 懒加载路由文件失效（新版本覆盖旧文件）时自动刷新兜底
 *
 * ## 版本指纹来源
 *
 * - 本地：模块加载时快照当前文档引用的构建产物文件名（即用户此刻运行的这份代码）
 * - 远端：请求 index.html 原文，用同一套规则提取文件名
 *
 * 请求失败、响应无法解析、指纹为空时一律静默跳过，不做任何提示
 *
 * @module utils/sys/version-check
 * @author Elysia Admin Team
 */
import { ElMessageBox } from 'element-plus'
import type { Router } from 'vue-router'

/** 两次检测之间的最小间隔（毫秒） */
const CHECK_INTERVAL = 5 * 60 * 1000

/** 本次会话中用户选择「稍后」忽略的版本指纹 */
const IGNORED_KEY = 'sys-version-ignored'

/** 刷新前记录的目标版本指纹，用于识别「刷新后依旧是旧版」的情况 */
const RELOAD_FLAG_KEY = 'sys-version-reloading'

/** 因懒加载文件缺失而自动刷新过的标记 */
const CHUNK_RELOAD_KEY = 'sys-chunk-reloading'

/** 匹配构建产物路径，如 assets/index-BqK3xY2p.js */
const ASSET_PATTERN = /assets\/([^"'\s>]+?\.(?:js|css))/g

/** 懒加载模块请求失败的错误特征 */
const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i

/**
 * 从任意文本中提取构建产物文件名并生成指纹
 * @param source HTML 原文或资源地址集合
 * @returns 去重排序后拼接的指纹字符串，未匹配到时为空串
 */
function extractFingerprint(source: string): string {
  const names = Array.from(source.matchAll(ASSET_PATTERN), (match) => match[1])
  return [...new Set(names)].sort().join(',')
}

/**
 * 读取当前文档引用的构建产物指纹
 *
 * 必须在应用挂载前调用，避免懒加载过程中动态插入的资源污染结果
 *
 * @returns 当前运行版本的指纹
 */
function readLocalFingerprint(): string {
  const nodes = document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>(
    'script[src], link[href]'
  )
  const urls = Array.from(nodes, (node) => ('src' in node ? node.src : node.href))
  return extractFingerprint(urls.join('\n'))
}

/** 当前运行版本的指纹（模块加载即快照） */
const LOCAL_FINGERPRINT = readLocalFingerprint()

let lastCheckAt = Date.now()
let checking = false
let prompting = false
// 开发环境无 hash 产物，指纹为空时无法比对，直接关闭检测
let disabled = !import.meta.env.PROD || !LOCAL_FINGERPRINT

/**
 * 拉取服务端最新的 index.html 并解析指纹
 *
 * 通过时间戳参数与 no-store 绕过浏览器缓存，无需服务端配置缓存策略
 *
 * @returns 最新版本指纹，请求失败或未匹配到时为空串
 */
async function readRemoteFingerprint(): Promise<string> {
  const url = new URL(`${import.meta.env.BASE_URL || './'}index.html`, window.location.href)
  url.searchParams.set('t', String(Date.now()))

  const response = await fetch(url.href, { cache: 'no-store' })
  if (!response.ok) return ''

  return extractFingerprint(await response.text())
}

/**
 * 弹出更新提示
 * @param remote 服务端最新版本指纹
 */
async function promptUpdate(remote: string): Promise<void> {
  prompting = true

  try {
    await ElMessageBox.confirm('系统已发布新版本，刷新页面后即可使用最新功能。', '发现新版本', {
      confirmButtonText: '立即刷新',
      cancelButtonText: '稍后',
      type: 'info',
      closeOnClickModal: false,
      closeOnPressEscape: false
    })
    sessionStorage.setItem(RELOAD_FLAG_KEY, remote)
    window.location.reload()
  } catch {
    // 用户选择稍后，本次会话内不再对该版本重复提示
    sessionStorage.setItem(IGNORED_KEY, remote)
  } finally {
    prompting = false
  }
}

/**
 * 检测是否存在新版本
 *
 * 处理流程：
 * 1. 校验开关、并发与检测间隔
 * 2. 拉取服务端最新指纹
 * 3. 与本地指纹及已忽略版本比对
 * 4. 存在差异时提示刷新
 *
 * @param force 是否忽略检测间隔限制
 */
export async function checkAppVersion(force = false): Promise<void> {
  if (disabled || checking || prompting) return
  if (!force && Date.now() - lastCheckAt < CHECK_INTERVAL) return

  checking = true

  try {
    const remote = await readRemoteFingerprint()
    if (!remote || remote === LOCAL_FINGERPRINT) return
    if (sessionStorage.getItem(IGNORED_KEY) === remote) return

    await promptUpdate(remote)
  } catch {
    // 断网、服务不可用或响应无法解析时静默跳过
  } finally {
    lastCheckAt = Date.now()
    checking = false
  }
}

/**
 * 校验上一次刷新是否真正生效
 *
 * 若刷新后本地指纹仍未变化，说明 HTML 被强缓存，继续提示只会陷入
 * 「提示 → 刷新 → 再提示」的死循环，因此本次会话不再检测
 */
function guardIneffectiveReload(): void {
  const expected = sessionStorage.getItem(RELOAD_FLAG_KEY)
  if (!expected) return

  sessionStorage.removeItem(RELOAD_FLAG_KEY)
  if (expected !== LOCAL_FINGERPRINT) disabled = true
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
 * 检测时机：页面从后台切回前台、路由切换（均受最小间隔限制）
 *
 * @param router 路由实例
 */
export function setupVersionCheck(router: Router): void {
  guardIneffectiveReload()

  router.onError(handleRouterError)
  router.afterEach(() => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    void checkAppVersion()
  })

  if (disabled) return

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkAppVersion()
  })
}