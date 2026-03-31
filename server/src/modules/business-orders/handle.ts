import { Context } from 'elysia';
import {
    InsertOne,
    UpdateByKey,
    SoftDeleteByKeys,
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
            title: 'DR钻戒',
            description: '一生只送一人',
            amount: 100.12,
            paymentMethod: 'alipay',
            extra: {
                productId: 1,
                productName: 'DR钻戒',
                productPrice: 100.12,
                productNum: 1,
                productTotal: 100.12,
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
            jobName,
            jobCron,
            status,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(businessOrdersSchema)
            .eq('delFlag', false)
            .like('jobName', jobName)
            .eq('jobCron', jobCron)
            .eq('status', status)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(businessOrdersSchema, whereCondition, {
            pageNum,
            pageSize,
            orderByColumn,
            sortRule
        });
        return BaseResultData.ok(res);
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