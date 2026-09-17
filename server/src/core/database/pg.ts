import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import config from '@/config';
import { logger } from '@/shared/logger';

// 配置 PostgreSQL 连接池（实际 TCP 在首次查询 / EnsurePg 时建立）
const client = postgres({
    host: config.pg.host,
    port: config.pg.port,
    username: config.pg.username,
    password: config.pg.password,
    database: config.pg.database,
    max: config.pg.max, // 最大连接数
    idle_timeout: config.pg.idle_timeout, // 空闲连接超时（秒）
    connect_timeout: config.pg.connect_timeout, // 连接超时（秒）
    max_lifetime: 60 * 30, // 连接最大生命周期 30分钟（秒）
    ssl: config.pg.ssl,
    // 连接池优化配置
    onnotice: () => { }, // 禁用 PostgreSQL 通知日志，减少内存占用
    transform: {
        undefined: null, // 将 undefined 转换为 null
    },
    // 调试模式（生产环境建议关闭）
    debug: process.env.NODE_ENV !== 'production' ? false : false,
});

const pg = drizzle(client);

/**
 * 启动前检测 PostgreSQL 是否可连（须在 CreateApp / seed 之前调用）
 * @throws 连接失败时抛出含中文说明的 Error
 */
export async function EnsurePg(): Promise<void> {
    try {
        await pg.execute(sql`SELECT 1`);
        logger.info('PostgreSQL 连接成功');
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new Error(`PostgreSQL 连接失败，请检查 pg 配置与服务状态：${detail}`);
    }
}

// 优雅关闭连接池
process.on('SIGINT', async () => {
    logger.info('正在关闭数据库连接池...');
    await client.end({ timeout: 5 });
    logger.info('数据库连接池已关闭');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('正在关闭数据库连接池...');
    await client.end({ timeout: 5 });
    logger.info('数据库连接池已关闭');
    process.exit(0);
});

export default pg;
/** 底层 postgres.js 客户端（任意 SQL / DDL 等场景） */
export { client as pgClient };