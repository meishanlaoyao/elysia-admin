import pg from '@/client/pg';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import config from '@/config';
import { RouteList } from '@/routes';
import { CacheEnum } from '@/common/enum';
import { SYSTEM_API_METHOD } from '@/common/dict';

/**
 * 初始化pg数据库
 */
async function InitPgData() {
    try {
        const result = await pg.execute(sql`SELECT COUNT(*) as count FROM "system_user"`);
        const count = result[0]?.count;
        if (count && Number(count) > 0) return console.log('PostgreSQL数据库已有数据，跳过初始化');
        console.log('PostgreSQL数据库无数据，开始初始化...');
        await executeSqlFile();
    } catch (error) {
        console.error('查询PostgreSQL数据库失败，尝试初始化数据库');
        await executeSqlFile();
    }
};

/**
 * 执行 SQL 文件初始化数据库
 */
async function executeSqlFile() {
    const sqlClient = postgres({ ...config.pg, max: 1 });
    try {
        const sqlFilePath = `${process.cwd()}/sql/pg.sql`;
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
        console.log('PostgreSQL数据库初始化成功');
    } catch (error) {
        console.error('PostgreSQL执行 SQL 文件失败:', error);
        throw error;
    } finally {
        await sqlClient.end();
    }
};

/**
 * 初始化需要权限的api数据
 * 初始化熔断的api数据
 */
async function InitApiData() {
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
 * 初始化种子数据
 * 1. 初始化pg数据库
 * 2. 初始化api数据
 * 3. 初始化熔断的api数据
 */
export async function InitSeedData() {
    await InitPgData();
    await InitApiData();
};