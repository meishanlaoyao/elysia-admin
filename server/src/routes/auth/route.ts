import type { IRouteModule } from "@/common/route";
import { accountPasswordLogin, refreshToken, registerUser, forgetPassword, resetPassword } from "./handle";
import { AccountPasswordLoginDto, RegisterUserDto, ForgetPasswordDto, ResetPasswordDto } from "./dto";

const AuthModule: IRouteModule = {
    tags: '认证模块',
    routes: [
        { url: '/auth/login', method: 'post', summary: 'web账号密码登录', dto: AccountPasswordLoginDto, handle: accountPasswordLogin, meta: { isAuth: false }, },
        { url: '/auth/refresh', method: 'post', summary: '刷新令牌', handle: refreshToken, meta: { isAuth: false }, },
        { url: '/auth/register', method: 'post', summary: '注册用户', dto: RegisterUserDto, handle: registerUser, meta: { isAuth: false }, },
        { url: '/auth/forget', method: 'post', summary: '忘记密码', dto: ForgetPasswordDto, handle: forgetPassword, meta: { isAuth: false }, },
        { url: '/auth/reset-password', method: 'post', summary: '重置密码', dto: ResetPasswordDto, handle: resetPassword, meta: { isAuth: false }, },
    ]
};

export default AuthModule;