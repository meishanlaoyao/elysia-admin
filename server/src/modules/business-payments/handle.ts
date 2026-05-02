import { Context } from 'elysia';
import { eq } from 'drizzle-orm';
import pg from '@/core/database/pg';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    CreateQueryBuilder,
    FindPage,
    FindAll,
    FindOneByKey,
} from '@/core/database/repository';
import { Pay } from '@/infrastructure/clients/payment';
import { businessOrdersSchema } from '@database/schema/business_orders';
import { businessPaymentsSchema } from '@database/schema/business_payments';
import { businessMerchantSchema, businessMerchantConfigsSchema } from '@database/schema/business_merchant';
import type { PaymentChannel, PaymentPlatform, } from '@/types/pay';

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
        const payment = await FindOneByKey(businessPaymentsSchema, 'orderNo', orderInfo.orderNo);
        if (payment) {
            if (payment.delFlag) return BaseResultData.fail(404, '支付记录不存在');
            if (orderInfo.status === '0') {
                // 待支付
                await pg.update(businessPaymentsSchema)
                    .set({ paymentMethod, platform, updateBy: userId, updateTime: new Date() })
                    .where(eq(businessPaymentsSchema.orderNo, orderInfo.orderNo));
            };
            switch (orderInfo.status) {
                case '1':
                    // 成功
                    return BaseResultData.fail(400, '订单已完成');
                case '2':
                    // 失败
                    return BaseResultData.fail(400, '订单已失败');
                case '3':
                    // 已关闭
                    return BaseResultData.fail(400, '订单已关闭');
            };
        } else {
            await InsertOne(
                businessPaymentsSchema,
                null,
                {
                    orderId: orderInfo.id,
                    orderNo: orderInfo.orderNo,
                    merchantConfigId: orderInfo.merchantId,
                    paymentMethod,
                    platform,
                    createBy: userId,
                    paymentNo: result.paymentNo,
                }
            );
        };
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
            paymentNo,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(businessPaymentsSchema)
            .eq('delFlag', false)
            .eq('orderNo', orderNo)
            .eq('paymentNo', paymentNo)
            .eq('status', status)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(businessPaymentsSchema, whereCondition, {
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

export async function findOne(ctx: Context) {
    try {
        const id = ctx.params.id;
        const res = await FindOneByKey(businessPaymentsSchema, 'id', id);
        return BaseResultData.ok(res);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function payOrderReturn(ctx: Context) {
    try {
        /**
         * 1.查订单状态
         * 2.网页端：302重定向到前端结果页
         */
        console.log('同步通知', ctx.query);
        return 'success';
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function payOrderNotify(ctx: Context) {
    try {
        /**
         * 1.验签
         * 2.更新订单状态
         * 3.返回成功结果
         */
        const data: any = ctx.body;
        const paymentNo = data?.out_trade_no || '';
        if (paymentNo) {
            const payment = await FindOneByKey(businessPaymentsSchema, 'paymentNo', paymentNo);
            if (payment && !payment?.delFlag && payment?.status === '0') {
                let thirdTradeNo = ''; // 第三方交易号
                let status = '2'; // 订单状态 （默认失败）
                let amount = 0; // 实付金额
                if (payment.paymentMethod === 'alipay') {
                    // 支付宝
                    thirdTradeNo = data?.trade_no || '';
                    status = data?.trade_status === 'TRADE_SUCCESS' ? '1' : '2';
                    amount = data?.buyer_pay_amount || 0;
                } else if (payment.paymentMethod === 'wechat') {
                    // 微信
                } else if (payment.paymentMethod === 'paypal') {
                    // PayPal
                }
                // await pg.update(businessPaymentsSchema)
                //     .set({
                //         amount: Number(amount),
                //         status,
                //         thirdTradeNo,
                //         extra: data,
                //         updateTime: new Date(),
                //     })
                //     .where(eq(businessPaymentsSchema.paymentNo, paymentNo));
            };
        };
        return 'success';
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};