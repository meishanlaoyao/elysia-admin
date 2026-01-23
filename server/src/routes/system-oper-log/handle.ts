import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/common/db';
import { systemOperLogSchema } from '@/schema/system_oper_log';

// 插入操作日志
export async function InsertOperLog(data: typeof systemOperLogSchema.$inferInsert) {
    try {
        await InsertOne(systemOperLogSchema, data);
    } catch (error) {
        console.error('插入操作日志失败', error);
    }
};
