/**
 * API 认证类型定义
 *
 * 提供登录、用户信息等认证相关类型
 *
 * @module types/api/auth
 */

declare namespace Api {
    /** 认证类型 */
    namespace Auth {
        /** 登录参数 */
        interface LoginParams {
            username: string
            password: string
        }

        /** 登录响应 */
        interface LoginResponse {
            token: string
            accessToken: string
            // refreshToken 通过 HTTP-only Cookie 返回，不在响应体中
        }

        /** 用户信息 */
        interface UserInfo {
            buttons: string[]
            roles: string[]
            userId: number
            userName: string
            email: string
            avatar?: string
        }

        /** 注册参数 */
        interface RegisterParams {
            username: string
            password: string
        }

        /** 忘记密码参数 */
        interface ForgetPasswordParams {
            email: string
        }

        /** 重置密码参数 */
        interface ResetPasswordParams {
            token: string
            uid: number
            password: string
        }
    }
}
