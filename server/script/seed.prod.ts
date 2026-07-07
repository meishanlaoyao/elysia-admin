import pg from '@/core/database/pg';
import { sql } from 'drizzle-orm';
import config from '@/config';
import { RouteList } from '@/modules';
import { CacheEnum } from '@/constants/enum';
import { SYSTEM_API_METHOD } from '@/constants/dict';
import { RegisterAllTasks } from '@/core/task-registry';

/**
 * 初始化需要权限的api数据
 * 初始化熔断的api数据
 */
async function initApiData() {
    const result = await pg.execute(sql`SELECT * FROM "system_api"`);
    const reverseMethodMap = Object.fromEntries(Object.entries(SYSTEM_API_METHOD).map(([key, value]) => [value, key]));
    const existingApiMap = new Map<string, any>();
    for (const item of result) {
        const key = `${item.api_path}:${item.api_method}`;
        existingApiMap.set(key, item);
    };
    const toInsert: Array<{ apiName: string; apiPath: string; apiMethod: string }> = [];
    const fallbackApiKeys: Array<{ key: string, value: string }> = [];
    for (const routeItem of RouteList) {
        const { tags, route } = routeItem;
        const { url, method, summary } = route;
        const apiName = `${tags[0]}-${summary}`;
        const apiPath = `${config.app.prefix}${url}`;
        const apiMethod = SYSTEM_API_METHOD[method.toUpperCase()];
        const key = `${apiPath}:${apiMethod}`;
        const existingApi = existingApiMap.get(key);
        if (!existingApi) {
            toInsert.push({ apiName, apiPath, apiMethod });
        } else if (!existingApi?.status) {
            fallbackApiKeys.push({
                key: `${CacheEnum.FALLBACK_API}${reverseMethodMap[existingApi.api_method]}:${existingApi.api_path}`,
                value: '1'
            });
        };
    };
    if (toInsert.length) {
        const values = toInsert.map(item => sql`(${item.apiName}, ${item.apiPath}, ${item.apiMethod}, true)`);
        await pg.execute(sql`
            INSERT INTO "system_api" (api_name, api_path, api_method, status)
            VALUES ${sql.join(values, sql`, `)}
        `);
    };
};

/**
 * 初始化cron任务
 * 从数据库恢复所有启用的定时任务到 BullMQ repeat 队列
 */
async function initCronJob() {
    await RegisterAllTasks();
};

/** 生产/开发共用：API 同步 + 定时任务恢复 */
export async function InitSeedData() {
    await initApiData();
    await initCronJob();
};