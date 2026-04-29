import { Context } from 'elysia';
import config from '@/config';
import { logger } from '@/shared/logger';
import {
    InsertOne,
    UpdateByKey,
    CreateQueryBuilder,
    FindPage,
    FindAll,
    FindOneByKey,
} from '@/core/database/repository';
import { GenerateUUID } from '@/shared/uuid';
import { BaseResultData } from '@/core/result';
import { queueManager, } from '@/infrastructure/queue';
import { Pay } from '@/infrastructure/clients/payment';
import { businessOrdersSchema } from '@database/schema/business_orders';
import { businessPaymentsSchema } from '@database/schema/business_payments';
import { businessMerchantSchema, businessMerchantConfigsSchema } from '@database/schema/business_merchant';
import type { PaymentChannel, PaymentPlatform, } from '@/types/pay';

/**
 * 获取 flow-buffer-queue 实例
 */
function getFlowBufferQueue() {
    const queue = queueManager.getQueue('flow-buffer-queue');
    if (!queue) throw new Error('flow-buffer-queue 未注册');
    return queue;
};

export async function create(ctx: Context) {
    try {
        const userId = (ctx as any)?.user?.userId;
        // TODO: 这里自行处理创建订单逻辑，这里我用模拟数据来演示
        const mockData = {
            userId,
            merchantId: 6,
            title: 'DR钻戒-求婚系列',
            description: '一生只送一人，真爱唯一的承诺',
            amount: 12899.00,
            currency: 'CNY',
            extra: {
                product: {
                    productId: 101,
                    productName: 'DR钻戒-心形1克拉',
                    productPrice: 12899.00, // 单价
                    productNum: 1,        // 数量
                    productTotal: 12899.00, // 小计
                    specs: "圈口: 12号; 材质: 18K金; 主钻: 30分"
                },
                user: {
                    userId: userId,
                    nickname: "张三", // 扩展：用户昵称
                    phone: "13800138000", // 扩展：收货电话
                    address: "北京市海淀区中关村软件园二期", // 详细地址
                    postalCode: "100000" // 扩展：邮编
                },
                marketing: {
                    couponId: null, // 使用的优惠券ID
                    discountAmount: 0 // 优惠金额
                }
            },
        };

        /**
         * 创建订单之前，请遵循以下规则：
         * 1. 商品数量与价格
         *  - 数量：是大于 0 的整数。
         *  - 价格：价格需要从数据库中获取，并重新计算总价。
         * 2. 商品状态与库存
         *  - 商品有效性：商品必须是有效状态，不能是已删除或已售罄。
         *  - 库存校验（预占库存）：需要检查商品库存是否充足，如果库存不足，应直接拦截并提示用户。
         * 3. 营销与优惠
         *  - 优惠券有效性：必须校验该优惠券是否存在、是否属于当前用户、是否已过期、是否满足使用门槛（如满减条件）。
         *  - 优惠金额计算：根据校验通过的优惠券规则，重新计算优惠金额，确保最终支付金额的准确性。
         * 4. 用户与收货信息
         *  - 用户身份：校验 userId 是否有效，确保是当前登录用户。
         *  - 收货地址：校验地址信息是否完整（省、市、区、详细地址），手机号格式是否正确。
         * 
         * 注意：校验逻辑作者并没有实现，需要根据实际情况自己实现。
         */

        const orderNo = await generateOrder(mockData);
        return BaseResultData.ok(orderNo);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function payOrder(ctx: Context) {
    try {
        /**
         * 发起支付之前，请遵循以下规则：
         * 1. 订单状态与权限
         *  - 订单有效性：订单必须存在且未被逻辑删除。
         *  - 支付状态：订单状态必须为“待支付”（如 status=0），若已支付、已取消或已退款，应直接拦截。
         *  - 权限校验：当前登录用户（userId）必须是订单的创建者，防止越权支付。
         *  - 时效性检查：检查当前时间是否超过订单过期时间（expireTime），过期订单禁止支付。
         * 
         * 2. 金额与数据一致性
         *  - 金额防篡改：支付金额必须以数据库中订单的 `amount` 为准，严禁直接使用前端传来的金额参数。
         *  - 商户配置：根据订单关联的 `merchantId` 获取正确的商户配置（如 AppID、Secret），确保资金进入正确账户。
         * 
         * 3. 支付流水与幂等性
         *  - 唯一支付单号：必须生成全局唯一的支付流水号（paymentNo），用于关联第三方交易。
         *  - 幂等性检查：检查是否存在同一订单的“待支付”流水记录。若存在，应复用或返回旧记录的支付参数，避免重复创建。
         *  - 渠道映射：根据前端传来的 `paymentMethod`（如微信）和 `platform`（如H5），映射为系统内部的具体渠道编码（如 `WX_NATIVE`）。
         * 
         * 4. 事务与第三方交互
         *  - 数据库事务：插入支付流水记录必须在数据库事务中进行，确保数据原子性。
         *  - 统一下单：必须调用第三方支付网关（微信/支付宝）的“统一下单”接口，获取预支付凭证（如 prepay_id）。
         *  - 签名返回：将第三方返回的签名参数（timeStamp, paySign, nonceStr等）返回给前端，以便唤起收银台。
         * 
         * 注意：所有涉及金额的计算和状态的流转，必须在数据库事务中完成，防止并发导致的数据不一致。
         */
        const userId = (ctx as any)?.user?.userId;
        const { orderNo, paymentMethod, platform } = ctx.body as { orderNo: string; paymentMethod: PaymentChannel; platform: PaymentPlatform };
        // 订单信息
        const orderInfo = await FindOneByKey(businessOrdersSchema, 'orderNo', orderNo);
        if (!orderInfo) return BaseResultData.fail(404, '订单不存在');
        if (orderInfo.delFlag) return BaseResultData.fail(404, '订单不存在');
        if (userId != orderInfo.createBy) return BaseResultData.fail(403, '您没有权限支付该订单');
        const nowTime = new Date().getTime();
        if (nowTime > new Date(orderInfo?.expireTime || '').getTime()) return BaseResultData.fail(400, '订单已过期');
        // 字典：system_orders_status
        switch (orderInfo.status) {
            case '1':
                // 已支付
                return BaseResultData.fail(400, '订单已支付');
            case '2':
                // 已取消
                return BaseResultData.fail(400, '订单已取消');
            case '3':
                // 已过期
                return BaseResultData.fail(400, '订单已过期');
            case '4':
                // 已退款
                return BaseResultData.fail(400, '订单已退款');
        };
        // 商家信息
        const merchantInfo = await FindOneByKey(businessMerchantSchema, 'id', orderInfo.merchantId);
        if (!merchantInfo) return BaseResultData.fail(404, '商家不存在');
        if (merchantInfo.delFlag) return BaseResultData.fail(404, '商家不存在');
        if (!merchantInfo.status) return BaseResultData.fail(400, '商家已禁用');
        // 商家配置
        const where = CreateQueryBuilder(businessMerchantConfigsSchema)
            .eq('delFlag', false)
            .eq('status', true)
            .eq('channel', paymentMethod)
            .eq('merchantId', orderInfo.merchantId)
            .build();
        const merchantConfigArr = await FindAll(businessMerchantConfigsSchema, where);
        const merchantConfig = merchantConfigArr[0] || null;
        if (!merchantConfig) return BaseResultData.fail(404, '商家配置不存在');
        if (merchantConfig.delFlag) return BaseResultData.fail(404, '商家配置不存在');
        if (!merchantConfig.status) return BaseResultData.fail(400, '商家配置已禁用');
        /**
         * 判断逻辑：
         * 判断属于哪种支付，再调用对应的请求接口
         */
        const { notifyUrl, returnUrl } = merchantConfig.config as any;
        const result = await Pay(paymentMethod, platform).create(
            merchantConfig,
            {
                orderNo,
                title: orderInfo.title,
                amount: orderInfo.amount + '',
                currency: orderInfo.currency,
                notifyUrl,
                returnUrl,
            }
        );
        await InsertOne(
            businessPaymentsSchema,
            null,
            {
                orderId: orderInfo.id,
                merchantConfigId: orderInfo.merchantId,
                channel: paymentMethod,
                platform,
                amount: orderInfo.amount,
                createBy: userId,
                paymentNo: result.paymentNo,
            }
        );
        return BaseResultData.ok(result);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findList(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = "createTime",
            sortRule = "desc",
            startTime,
            endTime,
            orderNo,
            status,
            paymentMethod,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(businessOrdersSchema)
            .eq('delFlag', false)
            .eq('orderNo', orderNo)
            .eq('status', status)
            .eq('paymentMethod', paymentMethod)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(businessOrdersSchema, whereCondition, {
            pageNum,
            pageSize,
            orderByColumn,
            sortRule
        });
        const nowTime = new Date().getTime();
        res.list = res.list.map((item: any) => {
            if (!item.expireTime) {
                item.timeout = 0;
                return item;
            };
            let time = new Date(item.expireTime).getTime() - nowTime;
            if (time < 0) time = 0;
            item.timeout = (time / 1000).toFixed(2);
            return item;
        });
        return BaseResultData.ok(res);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findOne(ctx: Context) {
    try {
        const id = ctx.params.id;
        const res = await FindOneByKey(businessOrdersSchema, 'id', id);
        return BaseResultData.ok(res);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        const updateBy = (ctx as any)?.user?.userId || null;
        const data = ctx.body as typeof businessOrdersSchema.$inferSelect;
        await UpdateByKey(businessOrdersSchema, 'id', null, {
            id: data.id,
            status: data.status,
            remark: data.remark,
            updateBy,
        });
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function payOrderReturn(ctx: Context) { };

export async function payOrderNotify(ctx: Context) { };

/**
 * 创建订单
 */
async function generateOrder(data: {
    userId: number;
    merchantId: number;
    title: string;
    description: string;
    amount: number;
    currency?: string;
    extra?: any;
}): Promise<string> {
    let orderNo = GenerateUUID();
    const { timeout } = config.orders;
    if (orderNo.length > 64) orderNo = orderNo.substring(0, 64);
    const amount = Number(data.amount);
    let extra: any = data.extra ?? {};
    if (typeof extra === 'string') {
        try {
            extra = JSON.parse(extra);
        } catch {
            extra = {};
        }
    };
    const order: any = {
        orderNo,
        userId: data.userId,
        merchantId: data.merchantId,
        title: data.title,
        description: data.description,
        amount: amount.toFixed(2),
        currency: data.currency || 'CNY',
        extra,
        createBy: data.userId,
        expireTime: new Date(Date.now() + 1000 * 60 + timeout),
    };
    try {
        // 使用事务，创建订单的同时，减库存 （这里只模拟订单创建）
        await InsertOne(businessOrdersSchema, null, order);
        const queue = getFlowBufferQueue();
        await queue.add('订单超时处理', { orderNo }, { delay: timeout });
        return orderNo;
    } catch (error) {
        throw error;
    }
};

/**
 * 订单超时处理
 */
export async function OrderTimeoutHandle(order: { orderNo: string }) {
    try {
        const orderInfo = await FindOneByKey(businessOrdersSchema, 'orderNo', order.orderNo);
        if (orderInfo?.delFlag) return;
        // 订单状态字典：system_orders_status
        if (orderInfo?.status !== '0') return;
        await UpdateByKey(
            businessOrdersSchema,
            'orderNo',
            null,
            {
                orderNo: orderInfo.orderNo,
                status: '3',
            }
        );
    } catch (error) {
        logger.error('订单超时处理失败：' + error);
    }
};