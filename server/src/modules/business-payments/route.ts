import type { IRouteModule } from "@/types/route";
import { PayOrderDto } from "./dto";
import { payOrder, payOrderReturn, payOrderNotify } from "./handle";

const BusinessPaymentsModule: IRouteModule = {
    tags: '支付模块',
    routes: [
        { url: '/business/payments', method: 'post', summary: '支付订单', dto: PayOrderDto, handle: payOrder, meta: { isAuth: true, ipRateLimit: '5:1' } },
        { url: '/business/payments/return', method: 'get', summary: '支付同步回调', handle: payOrderReturn, },
        { url: '/business/payments/notify', method: 'post', summary: '支付异步回调', handle: payOrderNotify, },
    ],
};

export default BusinessPaymentsModule;