import type { IRouteModule } from "@/types/route";
import { accountPasswordLogin, refreshToken, registerUser, forgetPassword, resetPassword, logout } from "./handle";
import { AccountPasswordLoginDto, RegisterUserDto, ForgetPasswordDto, ResetPasswordDto, RefreshTokenDto } from "./dto";

const AuthModule: IRouteModule = {
    tags: '认证模块',
    routes: [
        { url: '/auth/login', method: 'post', summary: 'web账号密码登录', dto: AccountPasswordLoginDto, handle: accountPasswordLogin, meta: { ipRateLimit: '120:3', } },
        { url: '/auth/refresh', method: 'post', summary: '刷新令牌', dto: RefreshTokenDto, handle: refreshToken, meta: { ipRateLimit: '60:2', } },
        { url: '/auth/register', method: 'post', summary: '注册用户', dto: RegisterUserDto, handle: registerUser, meta: { isLog: true, ipRateLimit: '60:2', } },
        { url: '/auth/forget', method: 'post', summary: '忘记密码', dto: ForgetPasswordDto, handle: forgetPassword, meta: { isLog: true, ipRateLimit: '60:2', } },
        { url: '/auth/reset-password', method: 'post', summary: '重置密码', dto: ResetPasswordDto, handle: resetPassword, meta: { isLog: true, ipRateLimit: '60:2', } },
        { url: '/auth/logout', method: 'get', summary: '退出登录', handle: logout, meta: { isAuth: true } },
    ]
};

export default AuthModule;