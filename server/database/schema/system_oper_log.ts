import { pgTable, bigserial, varchar, boolean, integer, bigint } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from 'database/base-schema';

export const systemOperLogSchema = pgTable(
    'system_oper_log',
    {
        operId: bigserial('oper_id', { mode: 'number' }).primaryKey(), // 操作日志 ID
        title: varchar('title', { length: 255 }), // 模块标题
        action: varchar('action', { length: 255 }), // 操作名称
        requestMethod: varchar('request_method', { length: 10 }), // 请求方式 GET / POST / PUT / DELETE
        operatorType: varchar('operator_type', { length: 32 }), // 操作人类型 admin / user / anonymous
        userId: bigint('user_id', { mode: 'number' }), // 操作人 ID
        operUrl: varchar('oper_url', { length: 256 }), // 操作URL
        operIp: varchar('oper_ip', { length: 128 }), // 操作IP
        operLocation: varchar('oper_location', { length: 256 }), // 操作地点
        operParam: varchar('oper_param', { length: 1024 }), // 操作参数
        jsonResult: varchar('json_result', { length: 1024 }), // JSON 结果
        costTime: integer('cost_time'), // 消耗时间
        status: boolean('status'), // 操作状态
        ...BaseSchema,
    }
);

export const InsertSystemOperLog = createInsertSchema(systemOperLogSchema);
export const SelectSystemOperLog = createSelectSchema(systemOperLogSchema);
