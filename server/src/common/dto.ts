import { t } from 'elysia';

/**
 * 基础结果DTO
 * @param other 其他数据类型
 * @returns 基础结果DTO
 */
export const BaseResultDto = (other: any) => ({
    response: {
        200: t.Object({
            code: t.Number(),
            msg: t.String(),
            data: t.Union([t.Null(), other]),
        }),
        500: t.Object({
            code: t.Number(),
            msg: t.String(),
            data: t.Null(),
        }),
    }
});

/**
 * 基础列表结果DTO
 * @param other 其他数据类型
 * @returns 基础列表结果DTO
 */
export const BaseResultListDto = (other: any) => ({
    response: {
        200: t.Object({
            code: t.Number(),
            msg: t.String(),
            data: t.Object({
                list: t.Array(other),
                total: t.Number(),
            }),
        }),
        500: t.Object({
            code: t.Number(),
            msg: t.String(),
            data: t.Null(),
        }),
    }
});

/**
 * 基础列表查询DTO
 * @param other 其他数据类型
 * @returns 基础列表查询DTO
 */
export const BaseListQueryDto = (other?: any) => t.Object({
    pageNo: t.Number({ description: "页码", default: 1 }),
    pageSize: t.Number({ description: "每页数量", default: 10 }),
    orderByColumn: t.Optional(t.String({ description: "排序字段", default: "createTime" })),
    sortRule: t.Optional(t.String({ description: "排序规则", default: "desc" })),
    startTime: t.Optional(t.String({ description: "开始时间" })),
    endTime: t.Optional(t.String({ description: "结束时间" })),
    ...other,
});

/**
 * 创建 Update DTO，自动处理日期字段为字符串
 * @param schema Drizzle select schema
 * @returns Update DTO with date fields as strings
 */
export const CreateUpdateDto = (schema: any) => {
    return t.Composite([
        t.Omit(schema, ['createTime', 'updateTime']),
        t.Object({
            createTime: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
            updateTime: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
        })
    ]);
};

/**
 * 转换日期字符串为 Date 对象
 * @param data 包含日期字段的数据
 * @returns 转换后的数据
 */
export const parseDateFields = (data: any) => {
    if (data.createTime && typeof data.createTime === 'string') {
        data.createTime = new Date(data.createTime);
    }
    if (data.updateTime && typeof data.updateTime === 'string') {
        data.updateTime = new Date(data.updateTime);
    }
    return data;
};