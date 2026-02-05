import { PgTransaction } from 'drizzle-orm/pg-core';
import { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import pg from '@/core/database/pg';
import { logger } from '@/shared/logger';

/**
 * 事务上下文类型
 */
export type TransactionContext = PgTransaction<
    PostgresJsQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
>;

/**
 * 事务回调函数类型
 */
export type TransactionCallback<T = any> = (tx: TransactionContext) => Promise<T>;

/**
 * 事务选项
 */
export interface TransactionOptions {
    /**
     * 事务隔离级别
     * - read uncommitted: 读未提交
     * - read committed: 读已提交（PostgreSQL 默认）
     * - repeatable read: 可重复读
     * - serializable: 串行化
     */
    isolationLevel?: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';

    /**
     * 事务访问模式
     * - read write: 读写（默认）
     * - read only: 只读
     */
    accessMode?: 'read write' | 'read only';

    /**
     * 是否启用错误日志（默认 true）
     */
    enableErrorLog?: boolean;

    /**
     * 自定义错误处理器
     */
    onError?: (error: Error) => void;

    /**
     * 事务开始前的钩子
     */
    onBegin?: () => void | Promise<void>;

    /**
     * 事务提交后的钩子
     */
    onCommit?: () => void | Promise<void>;

    /**
     * 事务回滚后的钩子
     */
    onRollback?: (error: Error) => void | Promise<void>;
}

/**
 * 执行事务
 * @param callback - 事务回调函数
 * @param options - 事务选项
 * @returns 事务执行结果
 */
export async function RunTransaction<T = any>(
    callback: TransactionCallback<T>,
    options: TransactionOptions = {}
): Promise<T> {
    const {
        isolationLevel,
        accessMode,
        enableErrorLog = true,
        onError,
        onBegin,
        onCommit,
        onRollback
    } = options;

    try {
        // 执行事务开始钩子
        if (onBegin) {
            await onBegin();
        }

        // 执行事务
        // 注意：postgres-js 驱动不支持通过选项对象设置 isolationLevel 和 accessMode
        // 如果需要设置隔离级别，需要在事务内手动执行 SQL
        const result = await pg.transaction(async (tx) => {
            // 如果指定了隔离级别或访问模式，手动设置
            if (isolationLevel || accessMode) {
                const parts: string[] = [];
                if (isolationLevel) {
                    parts.push(`ISOLATION LEVEL ${isolationLevel.toUpperCase().replace(' ', ' ')}`);
                }
                if (accessMode) {
                    parts.push(accessMode.toUpperCase());
                }
                if (parts.length > 0) {
                    await tx.execute(`SET TRANSACTION ${parts.join(', ')}`);
                }
            }
            return await callback(tx as TransactionContext);
        });

        // 执行事务提交钩子
        if (onCommit) {
            await onCommit();
        }

        return result;
    } catch (error) {
        const err = error as Error;

        // 执行事务回滚钩子
        if (onRollback) {
            await onRollback(err);
        }

        // 错误日志
        if (enableErrorLog) {
            logger.error('[Transaction Error]:' + err.message);
            logger.error('[Transaction Stack]:' + err.stack);
        }

        // 自定义错误处理
        if (onError) {
            onError(err);
        }

        throw err;
    }
}

/**
 * 事务构建器类
 * 提供链式调用的事务配置方式
 */
export class TransactionBuilder<T = any> {
    private callback?: TransactionCallback<T>;
    private options: TransactionOptions = {};

    /**
     * 设置事务回调函数
     */
    execute(callback: TransactionCallback<T>): this {
        this.callback = callback;
        return this;
    }

    /**
     * 设置事务隔离级别
     */
    isolation(level: TransactionOptions['isolationLevel']): this {
        this.options.isolationLevel = level;
        return this;
    }

    /**
     * 设置为只读事务
     */
    readOnly(): this {
        this.options.accessMode = 'read only';
        return this;
    }

    /**
     * 设置为读写事务
     */
    readWrite(): this {
        this.options.accessMode = 'read write';
        return this;
    }

    /**
     * 禁用错误日志
     */
    disableErrorLog(): this {
        this.options.enableErrorLog = false;
        return this;
    }

    /**
     * 设置错误处理器
     */
    onError(handler: (error: Error) => void): this {
        this.options.onError = handler;
        return this;
    }

    /**
     * 设置事务开始钩子
     */
    onBegin(handler: () => void | Promise<void>): this {
        this.options.onBegin = handler;
        return this;
    }

    /**
     * 设置事务提交钩子
     */
    onCommit(handler: () => void | Promise<void>): this {
        this.options.onCommit = handler;
        return this;
    }

    /**
     * 设置事务回滚钩子
     */
    onRollback(handler: (error: Error) => void | Promise<void>): this {
        this.options.onRollback = handler;
        return this;
    }

    /**
     * 运行事务
     */
    async run(): Promise<T> {
        if (!this.callback) {
            throw new Error('Transaction callback is not set. Use .execute() to set it.');
        }
        return await RunTransaction(this.callback, this.options);
    }
}

/**
 * 创建事务构建器
 * @returns 事务构建器实例
 * 
 * @example
 * const result = await CreateTransaction<{ userId: number }>()
 *   .isolation('serializable')
 *   .onBegin(() => console.log('Starting...'))
 *   .onCommit(() => console.log('Success!'))
 *   .execute(async (tx) => {
 *     const user = await tx.insert(userSchema).values({ name: 'John' }).returning();
 *     return { userId: user[0].id };
 *   })
 *   .run();
 */
export function CreateTransaction<T = any>(): TransactionBuilder<T> {
    return new TransactionBuilder<T>();
}

/**
 * 批量事务执行器
 * 按顺序执行多个事务，如果任何一个失败则停止
 */
export class BatchTransactionExecutor {
    private transactions: Array<{
        name: string;
        callback: TransactionCallback;
        options?: TransactionOptions;
    }> = [];

    /**
     * 添加事务
     */
    add(name: string, callback: TransactionCallback, options?: TransactionOptions): this {
        this.transactions.push({ name, callback, options });
        return this;
    }

    /**
     * 执行所有事务
     * @returns 所有事务的执行结果
     */
    async runAll(): Promise<Array<{ name: string; result: any; success: boolean; error?: Error }>> {
        const results: Array<{ name: string; result: any; success: boolean; error?: Error }> = [];

        for (const { name, callback, options } of this.transactions) {
            try {
                const result = await RunTransaction(callback, options);
                results.push({ name, result, success: true });
            } catch (error) {
                results.push({ name, result: null, success: false, error: error as Error });
                break; // 停止执行后续事务
            }
        }

        return results;
    }

    /**
     * 并行执行所有事务（独立事务，互不影响）
     * @returns 所有事务的执行结果
     */
    async runAllParallel(): Promise<Array<{ name: string; result: any; success: boolean; error?: Error }>> {
        const promises = this.transactions.map(async ({ name, callback, options }) => {
            try {
                const result = await RunTransaction(callback, options);
                return { name, result, success: true };
            } catch (error) {
                return { name, result: null, success: false, error: error as Error };
            }
        });

        return await Promise.all(promises);
    }
}

/**
 * 创建批量事务执行器
 * @returns 批量事务执行器实例
 * 
 * @example
 * const results = await CreateBatchTransaction()
 *   .add('createUser', async (tx) => {
 *     return await tx.insert(userSchema).values({ name: 'John' });
 *   })
 *   .add('createOrder', async (tx) => {
 *     return await tx.insert(orderSchema).values({ userId: 1 });
 *   })
 *   .runAll();
 */
export function CreateBatchTransaction(): BatchTransactionExecutor {
    return new BatchTransactionExecutor();
}

/**
 * 嵌套事务辅助函数
 * 检测是否在事务中，如果是则直接使用当前事务，否则创建新事务
 * 
 * @param txOrDb - 事务上下文或数据库实例
 * @param callback - 回调函数
 * @returns 执行结果
 * 
 * @example
 * async function createUser(name: string, tx?: TransactionContext) {
 *   return await WithTransaction(tx || pg, async (t) => {
 *     return await t.insert(userSchema).values({ name }).returning();
 *   });
 * }
 * 
 * // 可以在事务中调用
 * await RunTransaction(async (tx) => {
 *   await createUser('John', tx);
 *   await createUser('Jane', tx);
 * });
 * 
 * // 也可以独立调用
 * await createUser('Bob');
 */
export async function WithTransaction<T = any>(
    txOrDb: TransactionContext | typeof pg,
    callback: TransactionCallback<T>
): Promise<T> {
    // 检测是否已经在事务中
    const isInTransaction = 'rollback' in txOrDb;

    if (isInTransaction) {
        // 已在事务中，直接使用当前事务
        return await callback(txOrDb as TransactionContext);
    } else {
        // 不在事务中，创建新事务
        return await RunTransaction(callback);
    }
}
