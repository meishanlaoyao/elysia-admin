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
    pageNum: t.Number({ description: "页码", default: 1, minimum: 1, error: '页码须大于等于 1' }),
    pageSize: t.Number({ description: "每页数量", default: 10, minimum: 1, maximum: 100, error: '每页数量须在 1–100 之间' }),
    orderByColumn: t.Optional(t.String({ description: "排序字段" })),
    sortRule: t.Optional(t.String({ description: "排序规则" })),
    startTime: t.Optional(t.String({ description: "开始时间" })),
    endTime: t.Optional(t.String({ description: "结束时间" })),
    ...other,
});

/**
 * 创建 Update DTO，自动处理日期字段为字符串，除主键外所有字段可选
 * @param schema Drizzle select schema
 * @param primaryKey 主键字段名（默认为 'id'）
 * @returns Update DTO with optional fields except primary key
 */
export const CreateUpdateDto = (schema: any, primaryKey: string = 'id') => {
    // 先将所有字段变为可选
    const allOptional = t.Partial(schema);

    // 提取主键字段并设为必填
    const requiredPrimaryKey = t.Pick(schema, [primaryKey]);

    // 合并：必填主键 + 其他可选字段
    return t.Composite([
        requiredPrimaryKey,
        t.Omit(allOptional, [primaryKey, 'createTime', 'updateTime']),
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
 * 根据字段类型与标签构建带 error 的必填校验 schema
 */
const buildRequiredFieldSchema = (
    label: string,
    tsType: 'string' | 'number' | 'boolean',
) => {
    const error = `${label}不能为空`;
    const description = label;
    switch (tsType) {
        case 'number':
            return t.Number({ description, error });
        case 'boolean':
            return t.Boolean({ description, error });
        default:
            return t.String({ description, minLength: 1, error });
    }
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
     * @param fieldLabels 字段中文标签（传入后为必填字段生成 error）
     * @param fieldTypes 字段 TS 类型（与 fieldLabels 配合使用）
     */
    create: (
        insertSchema: any,
        selectSchema: any,
        requiredFields: string[],
        fieldLabels?: Record<string, string>,
        fieldTypes?: Record<string, 'string' | 'number' | 'boolean'>,
    ) => {
        const allOptional = t.Partial(insertSchema);

        let body;
        if (fieldLabels && Object.keys(fieldLabels).length > 0) {
            const requiredObj: Record<string, ReturnType<typeof buildRequiredFieldSchema>> = {};
            for (const field of requiredFields) {
                const label = fieldLabels[field] ?? field;
                const tsType = fieldTypes?.[field] ?? 'string';
                requiredObj[field] = buildRequiredFieldSchema(label, tsType);
            }
            body = t.Composite([
                t.Object(requiredObj),
                t.Omit(allOptional, requiredFields),
            ]);
        } else {
            const required = t.Pick(insertSchema, requiredFields);
            body = t.Composite([required, allOptional]);
        }

        return {
            body,
            ...BaseResultDto(selectSchema),
        };
    },

    /**
     * 创建 Update DTO
     * @param selectSchema Select schema
     * @param primaryKey 主键字段名（默认为 'id'）
     * @param extraFields 额外的字段定义
     */
    update: (selectSchema: any, primaryKey: string = 'id', extraFields?: any) => ({
        body: extraFields
            ? t.Composite([CreateUpdateDto(selectSchema, primaryKey), t.Object(extraFields)])
            : CreateUpdateDto(selectSchema, primaryKey),
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