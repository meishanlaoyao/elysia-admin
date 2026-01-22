import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/common/db';
import { systemLoginLogSchema } from '@/schema/system_login_log';


// 插入登陆日志
export async function InsertLoginLog(data: typeof systemLoginLogSchema.$inferInsert) {
    try {
        await InsertOne(systemLoginLogSchema, data);
    } catch (error) {
        console.log('插入登陆日志失败', error);
    }
};