import pg from '@/core/database/pg';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import config from '@/config';
import { RouteList } from '@/modules';
import { CacheEnum } from '@/constants/enum';
import { SYSTEM_API_METHOD } from '@/constants/dict';
import { logger } from '@/shared/logger';
import { CreateCronJob } from '@/shared/cron';
import { RegisterAllTasks } from '@/core/task-registry';

/**
 * 初始化pg数据库
 */
async function initPgData() {
    try {
        if (process.env.NODE_ENV === 'production') return;
        const result = await pg.execute(sql`SELECT COUNT(*) as count FROM "system_user"`);
        const count = result[0]?.count;
        if (count && Number(count) > 0) {
            logger.info('PostgreSQL 数据库已有数据，跳过初始化');
            return;
        };
        logger.info('PostgreSQL 数据库无数据，开始初始化...');
        await executeSqlFile();
    } catch (error) {
        logger.warn('查询 PostgreSQL 数据库失败，尝试初始化数据库');
        await executeSqlFile();
    }
};

/**
 * 执行 SQL 文件初始化数据库
 */
async function executeSqlFile() {
    const sqlClient = postgres({ ...config.pg, max: 1 });
    try {
        const sqlFilePath = `${process.cwd()}/database/sql/pg.sql`;
        const sqlFile = Bun.file(sqlFilePath);
        const sqlContent = await sqlFile.text();
        const originalLog = console.log;
        const originalError = console.error;
        console.log = () => { };
        console.error = () => { };
        try {
            await sqlClient.unsafe(sqlContent);
        } finally {
            console.log = originalLog;
            console.error = originalError;
        }
        logger.success('PostgreSQL 数据库初始化成功');
    } catch (error) {
        logger.error('PostgreSQL 执行 SQL 文件失败', { error });
        throw error;
    } finally {
        await sqlClient.end();
    }
};

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
 */
async function initCronJob() {
    await RegisterAllTasks();
    const result = await pg.execute(sql`SELECT * FROM "monitor_job" WHERE "status" = true AND del_flag = false`);
    if (!result.length) return;
    for (const job of result) {
        try {
            CreateCronJob(
                String(job.job_name),
                String(job.job_cron),
                String(job.job_name),
                job.job_args ? String(job.job_args) : undefined
            );
        } catch (error: any) {
            logger.error(`定时任务 [${job.job_name}] 启动失败:`, error);
        }
    }
};

/**
 * 初始化种子数据
 * 1. 初始化pg数据库
 * 2. 初始化api数据
 * 3. 初始化熔断的api数据
 * 4. 初始化cron任务
 */
export async function InitSeedData() {
    await initPgData();
    await initApiData();
    await initCronJob();
};