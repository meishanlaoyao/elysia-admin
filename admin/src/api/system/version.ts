import request from '@/utils/http'

/**
 * 查询版本信息（当前版本 + 历史版本列表）
 * 静默失败：由调用方决定是否展示错误，避免轮询检测时刷出提示
 */
export function fetchGetVersionInfo() {
  return request.get<Api.SystemVersion.VersionInfo>({
    url: '/api/system/version',
    showErrorMessage: false
  })
}
