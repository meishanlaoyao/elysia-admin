import type { IRouteModule } from "@/core/route";

const BusinessMerchantModule: IRouteModule = {
    tags: '商户模块',
    routes: [
        { url: '/business/merchant', method: 'post', summary: '创建', handle: () => { }, meta: { isAuth: true, isLog: true, permission: 'business:merchant:create' } },
    ]
};

export default BusinessMerchantModule;