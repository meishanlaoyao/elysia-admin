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