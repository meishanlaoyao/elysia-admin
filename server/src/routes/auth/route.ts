import type { IRouteModule } from "@/common/route";
import { accountPasswordLogin, refreshToken } from "./handle";
import { AccountPasswordLoginDto } from "./dto";

const AuthModule: IRouteModule = {
    tags: '认证模块',
    routes: [
        { url: '/auth/login', method: 'post', summary: '账号密码登录', isAuth: false, dto: AccountPasswordLoginDto, handle: accountPasswordLogin, },
        { url: '/auth/refresh', method: 'post', summary: '刷新令牌', isAuth: false, handle: refreshToken, },
    ]
};

export default AuthModule;