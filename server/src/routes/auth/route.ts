import type { IRouteModule } from "@/common/route";
import { accountPasswordLogin, refreshToken, registerUser } from "./handle";
import { AccountPasswordLoginDto, RegisterUserDto } from "./dto";

const AuthModule: IRouteModule = {
    tags: '认证模块',
    routes: [
        { url: '/auth/login', method: 'post', summary: '账号密码登录', isAuth: false, dto: AccountPasswordLoginDto, handle: accountPasswordLogin, },
        { url: '/auth/refresh', method: 'post', summary: '刷新令牌', isAuth: false, handle: refreshToken, },
        { url: '/auth/register', method: 'post', summary: '注册用户', isAuth: false, dto: RegisterUserDto, handle: registerUser, },
        { url: '/auth/forget', method: 'post', summary: '忘记密码', isAuth: false, dto: RegisterUserDto, handle: registerUser, },
    ]
};

export default AuthModule;