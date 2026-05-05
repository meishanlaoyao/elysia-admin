import { Context } from 'elysia';
import config from '@/config';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/shared/logger';
import {
    InsertOne,
    UpdateByKey,
    CreateQueryBuilder,
    FindPage,
    FindOneByKey,
} from '@/core/database/repository';
import { GenerateUUID } from '@/shared/uuid';
import { BaseResultData } from '@/core/result';
import { queueManager, } from '@/infrastructure/queue';
import { RunTransaction } from '@/core/database/transaction';
import { businessOrdersSchema } from '@database/schema/business_orders';
import { businessPaymentsSchema } from '@database/schema/business_payments';

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
            amount: 25698.00,           // 订单总金额
            currency: 'CNY',
            extra: {
                products: [             // 改为数组，支持多商品
                    {
                        productId: 101,
                        productName: 'DR钻戒-心形1克拉',
                        productPrice: 12899.00,
                        productNum: 1,
                        productTotal: 12899.00,
                        specs: "圈口: 12号; 材质: 18K金; 主钻: 30分"
                    },
                    {
                        productId: 102,
                        productName: 'DR对戒-经典款',
                        productPrice: 12799.00,
                        productNum: 1,
                        productTotal: 12799.00,
                        specs: "圈口: 男15号/女12号; 材质: PT950铂金"
                    }
                ],
                user: {
                    userId: userId,
                    nickname: "张三",
                    phone: "13800138000",
                    address: "北京市海淀区中关村软件园二期",
                    postalCode: "100000"
                },
                marketing: {
                    couponId: null, // 优惠券ID
                    discountAmount: 0, // 优惠金额
                    couponName: ""  // 扩展：优惠券名称
                }
            }
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
        if (!order.orderNo) return;
        await RunTransaction(async (tx) => {
            // 订单状态字典：system_orders_status
            await tx.update(businessOrdersSchema).set({ status: '3' }).where(
                and(
                    eq(businessOrdersSchema.orderNo, order.orderNo),
                    eq(businessOrdersSchema.status, '0'),
                    eq(businessOrdersSchema.delFlag, false),
                )
            );
            // 订单支付状态：system_pay_status
            await tx.update(businessPaymentsSchema).set({ status: '3' }).where(
                and(
                    eq(businessPaymentsSchema.orderNo, order.orderNo),
                    eq(businessPaymentsSchema.status, '0'),
                    eq(businessPaymentsSchema.delFlag, false),
                )
            );
        });
    } catch (error) {
        logger.error('订单超时处理失败：' + error);
    }
};