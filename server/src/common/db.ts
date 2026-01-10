import { PgTable, TableConfig, PgColumn } from 'drizzle-orm/pg-core';
import { SQL, eq, ne, inArray, notInArray, like, notLike, ilike, notIlike, gt, gte, lt, lte, between, notBetween, isNull, isNotNull, and, or, not, asc, desc, count } from 'drizzle-orm';
import pg from '@/client/pg';

// 导出 db 实例供直接使用
export const db = pg;

type InferInsertModel<T extends PgTable> = T extends PgTable<infer Config extends TableConfig>
    ? Config['columns'] extends infer Columns
    ? {
        [K in keyof Columns as Columns[K] extends { _: { notNull: true; hasDefault: false } }
        ? K
        : never
        ]: Columns[K] extends { _: { data: infer Data } } ? Data : never;
    } & {
        [K in keyof Columns as Columns[K] extends { _: { notNull: true; hasDefault: false } }
        ? never
        : K
        ]?: Columns[K] extends { _: { data: infer Data; notNull: true } }
        ? Data
        : Columns[K] extends { _: { data: infer Data } }
        ? Data | null
        : never;
    }
    : never
    : never;

type InferSelectModel<T extends PgTable> = T extends PgTable<infer Config extends TableConfig>
    ? Config['columns'] extends infer Columns
    ? {
        [K in keyof Columns]: Columns[K] extends { _: { data: infer Data; notNull: true } }
        ? Data
        : Columns[K] extends { _: { data: infer Data } }
        ? Data | null
        : never;
    }
    : never
    : never;

/**
 * 通用插入函数
 * @param schema - Drizzle ORM 表 schema
 * @param data - 要插入的数据
 * @returns 插入操作的结果
 */
export async function InsertOne<T extends PgTable>(
    schema: T,
    data: InferInsertModel<T>
) {
    return await pg.insert(schema).values(data as any);
};

/**
 * 通用批量插入函数
 * @param schema - Drizzle ORM 表 schema
 * @param data - 要插入的数据数组
 * @returns 插入操作的结果
 */
export async function InsertMany<T extends PgTable>(
    schema: T,
    data: InferInsertModel<T>[]
) {
    return await pg.insert(schema).values(data as any);
};

/**
 * 通用查询单条记录函数（根据主键）
 * @param schema - Drizzle ORM 表 schema
 * @param keyColumnName - 主键字段名（字符串）
 * @param value - 主键值
 * @returns 查询结果，如果没有找到返回 null
 */
export async function FindOneByKey<T extends PgTable>(
    schema: T,
    keyColumnName: string,
    value: any
): Promise<InferSelectModel<T> | null> {
    const keyColumn = (schema as any)[keyColumnName];
    if (!keyColumn) {
        throw new Error(`Column "${keyColumnName}" not found in schema`);
    }
    const data = await pg.select().from(schema as any).where(eq(keyColumn, value));
    return data.length > 0 ? (data[0] as InferSelectModel<T>) : null;
}

/**
 * 查询选项
 */
export interface QueryOptions<T extends PgTable = any> {
    orderByColumn?: string | PgColumn;
    sortRule?: 'asc' | 'desc';
    limit?: number;
};

/**
 * 通用查询全部记录函数（优化版 - 支持排序和限制）
 * @param schema - Drizzle ORM 表 schema
 * @param where - 查询条件（可选）
 * @param options - 查询选项（可选）
 * @returns 查询结果数组
 */
export async function FindAll<T extends PgTable>(
    schema: T,
    where?: SQL | undefined,
    options?: QueryOptions<T>
): Promise<InferSelectModel<T>[]> {
    let query = pg.select().from(schema as any).where(where);

    // 添加排序
    if (options?.orderByColumn) {
        const column = typeof options.orderByColumn === 'string'
            ? (schema as any)[options.orderByColumn]
            : options.orderByColumn;

        if (column) {
            const sortFn = options.sortRule === 'asc' ? asc : desc;
            query = query.orderBy(sortFn(column)) as any;
        }
    }

    // 添加限制
    if (options?.limit) {
        query = query.limit(options.limit) as any;
    }

    const data = await query;
    return data as InferSelectModel<T>[];
}

/**
 * 通用更新函数（根据主键）- 优化版
 * @param schema - Drizzle ORM 表 schema
 * @param keyColumnName - 主键字段名（字符串）
 * @param data - 要更新的数据（必须包含主键字段）
 * @param autoUpdateTime - 是否自动更新 updateTime 字段，默认为 true
 * @returns 更新操作的结果
 */
export async function UpdateByKey<T extends PgTable>(
    schema: T,
    keyColumnName: string,
    data: Partial<InferInsertModel<T>> & Record<string, any>,
    autoUpdateTime: boolean = true
) {
    const keyColumn = (schema as any)[keyColumnName];
    if (!keyColumn) {
        throw new Error(`Column "${keyColumnName}" not found in schema`);
    }

    const keyValue = (data as any)[keyColumnName];
    if (keyValue === undefined || keyValue === null) {
        throw new Error(`Key value for "${keyColumnName}" is required in data`);
    }

    // 只在需要时创建新对象
    let updateData = data;
    if (autoUpdateTime && 'updateTime' in schema) {
        updateData = { ...data, updateTime: new Date() };
    }

    return await pg.update(schema).set(updateData as any).where(eq(keyColumn, keyValue));
};

/**
 * 通用批量软删除函数 - 优化版
 * @param schema - Drizzle ORM 表 schema
 * @param keyColumnName - 主键字段名（字符串）
 * @param values - 主键值数组
 * @param autoUpdateTime - 是否自动更新 updateTime 字段，默认为 true
 * @returns 删除操作的结果
 */
export async function SoftDeleteByKeys<T extends PgTable>(
    schema: T,
    keyColumnName: string,
    values: any[],
    autoUpdateTime: boolean = true
) {
    if (!values || values.length === 0) {
        return; // 空数组直接返回，避免无效查询
    }

    const keyColumn = (schema as any)[keyColumnName];
    if (!keyColumn) {
        throw new Error(`Column "${keyColumnName}" not found in schema`);
    }

    const updateData: any = { delFlag: true };
    if (autoUpdateTime && 'updateTime' in schema) {
        updateData.updateTime = new Date();
    }

    return await pg.update(schema).set(updateData).where(inArray(keyColumn, values));
};

/**
 * 通用硬删除函数（根据条件）
 * @param schema - Drizzle ORM 表 schema
 * @param where - 删除条件
 * @returns 删除操作的结果
 */
export async function HardDelete<T extends PgTable>(
    schema: T,
    where: SQL | undefined
) {
    return await pg.delete(schema).where(where);
};

/**
 * 通用批量硬删除函数（根据主键）
 * @param schema - Drizzle ORM 表 schema
 * @param keyColumnName - 主键字段名（字符串）
 * @param values - 主键值数组
 * @returns 删除操作的结果
 */
export async function HardDeleteByKeys<T extends PgTable>(
    schema: T,
    keyColumnName: string,
    values: any[]
) {
    if (!values || values.length === 0) {
        return; // 空数组直接返回，避免无效查询
    }

    const keyColumn = (schema as any)[keyColumnName];
    if (!keyColumn) {
        throw new Error(`Column "${keyColumnName}" not found in schema`);
    }

    return await pg.delete(schema).where(inArray(keyColumn, values));
};

/**
 * 分页查询选项
 */
export interface PaginationOptions<T extends PgTable = any> {
    pageNum?: number | string;
    pageSize?: number | string;
    orderByColumn?: string | PgColumn;
    sortRule?: string;
};

/**
 * 分页查询结果
 */
export interface PaginationResult<T> {
    list: T[];
    total: number;
};

/**
 * 通用分页查询函数（优化版 - 使用窗口函数减少查询次数）
 * @param schema - Drizzle ORM 表 schema
 * @param where - 查询条件
 * @param options - 分页选项
 * @returns 分页查询结果
 */
export async function FindPage<T extends PgTable>(
    schema: T,
    where: SQL | undefined,
    options: PaginationOptions<T> = {}
): Promise<PaginationResult<InferSelectModel<T>>> {
    const {
        pageNum = 1,
        pageSize = 10,
        orderByColumn,
        sortRule = 'desc'
    } = options;

    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const limit = Number(pageSize);
    const sortFn = String(sortRule).toLowerCase() === 'asc' ? asc : desc;

    // 使用子查询 + 窗口函数，一次查询同时获取数据和总数
    let baseQuery = pg.select().from(schema as any).where(where);

    // 添加排序
    if (orderByColumn) {
        const column = typeof orderByColumn === 'string'
            ? (schema as any)[orderByColumn]
            : orderByColumn;

        if (column) {
            baseQuery = baseQuery.orderBy(sortFn(column)) as any;
        }
    }

    // 先查询总数（如果数据量大，这个查询会被优化器缓存）
    const totalResult = await pg
        .select({ count: count() })
        .from(schema as any)
        .where(where);
    const total = Number(totalResult[0]?.count || 0);

    // 如果总数为 0，直接返回
    if (total === 0) {
        return { list: [], total: 0 };
    }

    // 查询分页数据
    const list = await baseQuery.limit(limit).offset(offset);

    return {
        list: list as InferSelectModel<T>[],
        total
    };
};

/**
 * 联查配置接口
 */
export interface JoinConfig<T extends PgTable = any, J extends PgTable = any> {
    joinSchema: J; // 要联查的表 schema
    fieldName: string; // 联查结果存放的字段名
    foreignKey: string | PgColumn; // 主表的外键字段
    primaryKey: string | PgColumn; // 联查表的主键字段
    defaultValue?: any; // 联查没有结果时的默认值
    where?: SQL | undefined; // 联查表的额外查询条件
    multiple?: boolean; // 是否返回多条记录（默认 true）
};

/**
 * 查询条件构建器
 * 用于构建复杂的查询条件，避免手动拼接条件
 */
export class QueryBuilder<T extends PgTable = any> {
    private conditions: SQL[] = [];
    private schema?: T;
    private joinConfigs: JoinConfig<T, any>[] = [];

    constructor(schema?: T) {
        this.schema = schema;
    };

    /**
     * 获取列对象（支持字符串或列对象）
     */
    private getColumn(column: string | PgColumn): PgColumn {
        if (typeof column === 'string') {
            if (!this.schema) {
                throw new Error('Schema is required when using string column names');
            }
            return (this.schema as any)[column];
        }
        return column;
    };

    /**
     * 精准匹配
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    eq(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(eq(this.getColumn(column), value));
        }
        return this;
    };

    /**
     * 不等于
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    ne(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(ne(this.getColumn(column), value));
        }
        return this;
    };

    /**
     * 在数组中（IN）
     * @param column - 字段名或字段对象
     * @param values - 值数组
     */
    in(column: string | PgColumn, values: any[]): this {
        if (values && values.length > 0) {
            this.conditions.push(inArray(this.getColumn(column), values));
        }
        return this;
    };

    /**
     * 不在数组中（NOT IN）
     * @param column - 字段名或字段对象
     * @param values - 值数组
     */
    notIn(column: string | PgColumn, values: any[]): this {
        if (values && values.length > 0) {
            this.conditions.push(notInArray(this.getColumn(column), values));
        }
        return this;
    };

    /**
     * 模糊匹配（包含，区分大小写）
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    like(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(like(this.getColumn(column), `%${value}%`));
        }
        return this;
    };

    /**
     * 模糊匹配（不包含，区分大小写）
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    notLike(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(notLike(this.getColumn(column), `%${value}%`));
        }
        return this;
    };

    /**
     * 模糊匹配（包含，不区分大小写）
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    ilike(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(ilike(this.getColumn(column), `%${value}%`));
        }
        return this;
    };

    /**
     * 模糊匹配（不包含，不区分大小写）
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    notIlike(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(notIlike(this.getColumn(column), `%${value}%`));
        }
        return this;
    };

    /**
     * 左模糊匹配（以...结尾）
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    leftLike(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(like(this.getColumn(column), `%${value}`));
        }
        return this;
    };

    /**
     * 右模糊匹配（以...开头）
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    rightLike(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(like(this.getColumn(column), `${value}%`));
        }
        return this;
    };

    /**
     * 大于
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    gt(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(gt(this.getColumn(column), value));
        }
        return this;
    };

    /**
     * 大于等于
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    gte(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(gte(this.getColumn(column), value));
        }
        return this;
    };

    /**
     * 小于
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    lt(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(lt(this.getColumn(column), value));
        }
        return this;
    };

    /**
     * 小于等于
     * @param column - 字段名或字段对象
     * @param value - 值
     */
    lte(column: string | PgColumn, value: any): this {
        if (value !== undefined && value !== null && value !== '') {
            this.conditions.push(lte(this.getColumn(column), value));
        }
        return this;
    };

    /**
     * 时间范围（在某个时间段内）
     * @param column - 字段名或字段对象
     * @param startTime - 开始时间
     * @param endTime - 结束时间
     */
    dateRange(column: string | PgColumn, startTime?: any, endTime?: any): this {
        const col = this.getColumn(column);
        if (startTime && endTime) {
            this.conditions.push(between(col, new Date(startTime), new Date(endTime)));
        } else if (startTime) {
            this.conditions.push(gte(col, new Date(startTime)));
        } else if (endTime) {
            this.conditions.push(lte(col, new Date(endTime)));
        }
        return this;
    };

    /**
     * 在某个时间段内（使用 between）
     * @param column - 字段名或字段对象
     * @param startTime - 开始时间
     * @param endTime - 结束时间
     */
    between(column: string | PgColumn, startTime: any, endTime: any): this {
        if (startTime && endTime) {
            this.conditions.push(between(this.getColumn(column), new Date(startTime), new Date(endTime)));
        }
        return this;
    };

    /**
     * 不在某个时间段内（使用 not between）
     * @param column - 字段名或字段对象
     * @param startTime - 开始时间
     * @param endTime - 结束时间
     */
    notBetween(column: string | PgColumn, startTime: any, endTime: any): this {
        if (startTime && endTime) {
            this.conditions.push(notBetween(this.getColumn(column), new Date(startTime), new Date(endTime)));
        }
        return this;
    };

    /**
     * 是否为 NULL
     * @param column - 字段名或字段对象
     */
    isNull(column: string | PgColumn): this {
        this.conditions.push(isNull(this.getColumn(column)));
        return this;
    };

    /**
     * 是否不为 NULL
     * @param column - 字段名或字段对象
     */
    isNotNull(column: string | PgColumn): this {
        this.conditions.push(isNotNull(this.getColumn(column)));
        return this;
    };

    /**
     * 添加 OR 条件组 - 优化版
     * @param callback - 回调函数，用于构建 OR 条件
     */
    or(callback: (builder: QueryBuilder<any>) => void): this {
        const orBuilder = new QueryBuilder(this.schema);
        callback(orBuilder);
        const conditions = orBuilder.conditions;

        if (conditions.length === 0) {
            return this;
        }

        if (conditions.length === 1) {
            this.conditions.push(conditions[0]);
        } else {
            this.conditions.push(or(...conditions)!);
        }

        return this;
    };

    /**
     * 添加 NOT 条件 - 优化版
     * @param callback - 回调函数，用于构建 NOT 条件
     */
    not(callback: (builder: QueryBuilder<any>) => void): this {
        const notBuilder = new QueryBuilder(this.schema);
        callback(notBuilder);
        const conditions = notBuilder.conditions;

        if (conditions.length === 0) {
            return this;
        }

        const notCondition = conditions.length === 1
            ? conditions[0]
            : and(...conditions)!;

        this.conditions.push(not(notCondition));
        return this;
    };

    /**
     * 添加自定义条件
     * @param condition - SQL 条件
     */
    custom(condition: SQL | undefined): this {
        if (condition) {
            this.conditions.push(condition);
        }
        return this;
    };

    /**
     * 构建最终的查询条件（使用 AND 连接）
     * @returns SQL 条件或 undefined
     */
    build(): SQL | undefined {
        if (this.conditions.length === 0) {
            return undefined;
        }
        if (this.conditions.length === 1) {
            return this.conditions[0];
        }
        return and(...this.conditions);
    };

    /**
     * 构建最终的查询条件（使用 OR 连接）
     * @returns SQL 条件或 undefined
     */
    buildOr(): SQL | undefined {
        if (this.conditions.length === 0) {
            return undefined;
        }
        if (this.conditions.length === 1) {
            return this.conditions[0];
        }
        return or(...this.conditions);
    };

    /**
     * 清空所有条件（用于重用实例）
     */
    clear(): this {
        this.conditions = [];
        return this;
    };

    /**
     * 获取当前条件数量
     */
    get length(): number {
        return this.conditions.length;
    };

    /**
     * 添加联查配置
     * @param config - 联查配置
     * @example
     * // 联查按钮权限，结果放在 authList 字段
     * builder.join({
     *   joinSchema: systemMenuBtnSchema,
     *   fieldName: 'authList',
     *   foreignKey: 'menuId',
     *   primaryKey: 'menuId',
     *   defaultValue: [],
     *   where: eq(systemMenuBtnSchema.delFlag, false),
     *   multiple: true
     * })
     */
    join<J extends PgTable>(config: JoinConfig<T, J>): this {
        this.joinConfigs.push(config);
        return this;
    };

    /**
     * 获取联查配置
     */
    getJoinConfigs(): JoinConfig<T, any>[] {
        return this.joinConfigs;
    };
};

/**
 * 创建查询条件构建器实例
 * @param schema - 可选的表 schema，传入后可以使用字符串字段名
 */
export function CreateQueryBuilder<T extends PgTable>(schema?: T): QueryBuilder<T> {
    return new QueryBuilder(schema);
};

/**
 * 对查询结果应用联查（优化版）
 * @param data - 主表查询结果
 * @param joinConfigs - 联查配置数组
 * @returns 包含联查数据的结果
 */
export async function ApplyJoins<T = any>(
    data: T[],
    joinConfigs: JoinConfig<any, any>[]
): Promise<T[]> {
    if (joinConfigs.length === 0 || data.length === 0) {
        return data;
    }

    // 并行执行所有联查查询
    const joinPromises = joinConfigs.map(async (config) => {
        const {
            joinSchema,
            fieldName,
            foreignKey,
            primaryKey,
            defaultValue = null,
            where: joinWhere,
            multiple = true
        } = config;

        // 获取字段名（TypeScript 属性名）
        const foreignKeyName = typeof foreignKey === 'string' ? foreignKey : foreignKey.name;
        const primaryKeyName = typeof primaryKey === 'string' ? primaryKey : primaryKey.name;
        const primaryKeyColumn = typeof primaryKey === 'string'
            ? (joinSchema as any)[primaryKey]
            : primaryKey;

        // 收集所有外键值并去重
        const foreignKeyValuesSet = new Set<any>();
        for (const item of data) {
            const val = (item as any)[foreignKeyName];
            if (val !== null && val !== undefined) {
                foreignKeyValuesSet.add(val);
            }
        }

        const foreignKeyValues = Array.from(foreignKeyValuesSet);

        if (foreignKeyValues.length === 0) {
            return { fieldName, data: null, multiple, defaultValue };
        }

        // 构建联查条件
        const joinConditions: SQL[] = [inArray(primaryKeyColumn, foreignKeyValues)];
        if (joinWhere) {
            joinConditions.push(joinWhere);
        }

        // 查询联查表数据
        const joinData = await pg
            .select()
            .from(joinSchema as any)
            .where(and(...joinConditions));

        // 将联查数据按主键分组
        const joinDataMap = new Map<any, any[]>();
        for (const item of joinData) {
            const key = (item as any)[primaryKeyName];
            if (!joinDataMap.has(key)) {
                joinDataMap.set(key, []);
            }
            joinDataMap.get(key)!.push(item);
        }

        return { fieldName, data: joinDataMap, multiple, defaultValue, foreignKeyName };
    });

    // 等待所有联查完成
    const joinResults = await Promise.all(joinPromises);

    // 合并所有联查结果到主表数据
    for (const result of joinResults) {
        const { fieldName, data: joinDataMap, multiple, defaultValue, foreignKeyName } = result;

        if (!joinDataMap) {
            // 没有外键值的情况
            for (const item of data) {
                (item as any)[fieldName] = multiple ? (defaultValue || []) : defaultValue;
            }
            continue;
        }

        // 合并数据
        for (const item of data) {
            const foreignKeyValue = (item as any)[foreignKeyName];
            const joinItems = joinDataMap.get(foreignKeyValue) || [];

            if (multiple) {
                (item as any)[fieldName] = joinItems.length > 0 ? joinItems : (defaultValue || []);
            } else {
                (item as any)[fieldName] = joinItems.length > 0 ? joinItems[0] : defaultValue;
            }
        }
    }

    return data;
};

/**
 * 通用查询全部记录函数（支持联查）
 * @param schema - Drizzle ORM 表 schema
 * @param builder - 查询条件构建器
 * @param options - 查询选项（可选）
 * @returns 查询结果数组（包含联查数据）
 */
export async function FindAllWithJoin<T extends PgTable>(
    schema: T,
    builder: QueryBuilder<T>,
    options?: QueryOptions<T>
): Promise<any[]> {
    const where = builder.build();
    const joinConfigs = builder.getJoinConfigs();

    // 先查询主表数据
    const mainData = await FindAll(schema, where, options);

    // 应用联查
    return await ApplyJoins(mainData, joinConfigs);
};

/**
 * 通用分页查询函数（支持联查）
 * @param schema - Drizzle ORM 表 schema
 * @param builder - 查询条件构建器
 * @param options - 分页选项
 * @returns 分页查询结果（包含联查数据）
 */
export async function FindPageWithJoin<T extends PgTable>(
    schema: T,
    builder: QueryBuilder<T>,
    options: PaginationOptions<T> = {}
): Promise<PaginationResult<any>> {
    const where = builder.build();
    const joinConfigs = builder.getJoinConfigs();

    // 先执行分页查询
    const result = await FindPage(schema, where, options);

    // 应用联查
    result.list = await ApplyJoins(result.list, joinConfigs);

    return result;
};