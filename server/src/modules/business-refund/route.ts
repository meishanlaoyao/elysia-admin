import type { IRouteModule } from "@/types/route";
import { create, update } from "./handle";
import { CreateDto, UpdateDto } from "./dto";

const BusinessRefundModule: IRouteModule = {
    tags: '退款模块',
    routes: [
        { url: '/business/refund', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, ipRateLimit: '3:1' } },
        { url: '/business/refund', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'business:refund:update' } },
    ],
};

export default BusinessRefundModule;