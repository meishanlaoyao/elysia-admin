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
    pageNum: t.Number({ description: "页码", default: 1 }),
    pageSize: t.Number({ description: "每页数量", default: 10 }),
    orderByColumn: t.Optional(t.String({ description: "排序字段" })),
    sortRule: t.Optional(t.String({ description: "排序规则" })),
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
export const ParseDateFields = (data: any) => {
    if (data.createTime && typeof data.createTime === 'string') {
        data.createTime = new Date(data.createTime);
    };
    if (data.updateTime && typeof data.updateTime === 'string') {
        data.updateTime = new Date(data.updateTime);
    };
    return data;
};

/**
 * 标准 CRUD DTO 生成器
 */
export const CrudDto = {
    /**
     * 创建 Create DTO
     * @param insertSchema Insert schema
     * @param selectSchema Select schema
     * @param requiredFields 必填字段数组
     */
    create: (insertSchema: any, selectSchema: any, requiredFields: string[]) => {
        // 将 insertSchema 的所有字段变为可选
        const allOptional = t.Partial(insertSchema);

        // 提取必填字段并设为必填
        const required = t.Pick(insertSchema, requiredFields);

        // 合并：必填字段 + 其他可选字段
        return {
            body: t.Composite([required, allOptional]),
            ...BaseResultDto(selectSchema),
        };
    },

    /**
     * 创建 Update DTO
     * @param selectSchema Select schema
     */
    update: (selectSchema: any) => ({
        body: CreateUpdateDto(selectSchema),
        ...BaseResultDto(selectSchema),
    }),

    /**
     * 创建 List DTO
     * @param selectSchema Select schema
     * @param queryFields 额外的查询字段
     */
    list: (selectSchema: any, queryFields?: any) => ({
        query: BaseListQueryDto(queryFields),
        ...BaseResultListDto(selectSchema),
    }),

    /**
     * 创建 FindAll DTO
     * @param selectSchema Select schema
     * @param queryFields 查询字段
     */
    findAll: (selectSchema: any, queryFields?: any) => ({
        query: t.Object(queryFields || {}),
        ...BaseResultDto(t.Array(selectSchema)),
    }),

    /**
     * 创建 FindOne DTO
     * @param selectSchema Select schema
     */
    findOne: (selectSchema: any) => ({
        ...BaseResultDto(selectSchema),
    }),
};