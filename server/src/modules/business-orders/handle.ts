import { Context } from 'elysia';
import config from '@/config';
import {
    InsertOne,
    UpdateByKey,
    CreateQueryBuilder,
    FindPage,
    FindOneByKey,
} from '@/core/database/repository';
import { BaseResultData } from '@/core/result';
import { GenerateUUID } from '@/shared/uuid';
import { businessOrdersSchema } from '@database/schema/business_orders';

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
            paymentMethod: 'alipay',
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
        const orderNo = await GenerateOrder(mockData);
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

interface IGenerateOrder {
    userId: number;
    merchantId: number;
    title: string;
    description: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
    extra?: any;
};
/**
 * 创建订单
 */
export async function GenerateOrder(data: IGenerateOrder): Promise<string> {
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
        paymentMethod: data.paymentMethod,
        extra,
        createBy: data.userId,
        expireTime: new Date(Date.now() + 1000 * 60 + timeout),
    };
    try {
        // 如果插入失败，注意表的外键约束，确保外键真实存在
        await InsertOne(businessOrdersSchema, null, order);
        // TODO: 这里可以使用分布式锁来让订单进行倒计时，过期后自动关闭订单
        return orderNo;
    } catch (error) {
        throw error;
    }
};