import type { IRouteModule } from "@/core/route";
import { accountPasswordLogin, refreshToken, registerUser, forgetPassword, resetPassword } from "./handle";
import { AccountPasswordLoginDto, RegisterUserDto, ForgetPasswordDto, ResetPasswordDto, RefreshTokenDto } from "./dto";

const AuthModule: IRouteModule = {
    tags: '认证模块',
    routes: [
        { url: '/auth/login', method: 'post', summary: 'web账号密码登录', dto: AccountPasswordLoginDto, handle: accountPasswordLogin, },
        { url: '/auth/refresh', method: 'post', summary: '刷新令牌', dto: RefreshTokenDto, handle: refreshToken, },
        { url: '/auth/register', method: 'post', summary: '注册用户', dto: RegisterUserDto, handle: registerUser, meta: { isLog: true, } },
        { url: '/auth/forget', method: 'post', summary: '忘记密码', dto: ForgetPasswordDto, handle: forgetPassword, meta: { isLog: true, } },
        { url: '/auth/reset-password', method: 'post', summary: '重置密码', dto: ResetPasswordDto, handle: resetPassword, meta: { isLog: true, } },
    ]
};

export default AuthModule;