import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    params
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/system/user/info'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

/**
 * 注册用户
 * @param params 注册参数
 * @returns 注册响应
 */
export function fetchRegister(params: Api.Auth.RegisterParams) {
  return request.post({
    url: '/api/auth/register',
    params
  })
}

// 忘记密码
export function fetchForgetPassword(params: Api.Auth.ForgetPasswordParams) {
  return request.post({
    url: '/api/auth/forget',
    params,
    showSuccessMessage: true // 显示成功消息
  })
}

// 重置密码
export function fetchResetPassword(params: Api.Auth.ResetPasswordParams) {
  return request.post({
    url: '/api/auth/reset-password',
    params,
    showSuccessMessage: true // 显示成功消息
  })
}

// 刷新token
export function fetchRefreshToken() {
  return request.post({
    url: '/api/auth/refresh',
  })
}