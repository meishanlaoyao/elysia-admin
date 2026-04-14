import { pgTable, bigserial, varchar, boolean, bigint, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';

export const systemQueueSchema = pgTable(
    'system_queue',
    {
        queueId: bigserial('queue_id', { mode: 'number' }).primaryKey(), // 队列ID
        name: varchar('name', { length: 100 }).notNull(), // 队列名称
        key: varchar('key', { length: 100 }).notNull().unique(), // 队列唯一标识
        redisId: bigint('redis_id', { mode: 'number' }).notNull().references(() => systemRedisConfigSchema.redisId), // redis队列ID
        concurrency: integer('concurrency').notNull().default(1), // 并发数
        status: boolean('status').default(true), // 状态
        ...BaseSchema,
    }
);
export const InsertSystemQueue = createInsertSchema(systemQueueSchema);
export const SelectSystemQueue = createSelectSchema(systemQueueSchema);

export const systemRedisConfigSchema = pgTable(
    'system_redis_config',
    {
        redisId: bigserial('redis_id', { mode: 'number' }).primaryKey(), // ID
        name: varchar('name', { length: 100 }).notNull(), // 配置名称
        host: varchar('host', { length: 255 }).notNull(), // redis地址
        port: integer('port').notNull().default(6379), // redis端口
        username: varchar('username', { length: 100 }), // redis用户名
        password: varchar('password', { length: 255 }), // redis密码
        db: integer('db').notNull().default(0), // redis数据库
        status: boolean('status').default(true), // 状态
        ...BaseSchema,
    }
);
export const InsertSystemRedisConfig = createInsertSchema(systemRedisConfigSchema);
export const SelectSystemRedisConfig = createSelectSchema(systemRedisConfigSchema);