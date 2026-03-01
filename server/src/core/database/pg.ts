import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import config from '@/config';
import { logger } from '@/shared/logger';

// 配置 PostgreSQL 连接池
const client = postgres({
    host: config.pg.host,
    port: config.pg.port,
    username: config.pg.username,
    password: config.pg.password,
    database: config.pg.database,
    max: config.pg.max, // 最大连接数
    idle_timeout: config.pg.idle_timeout, // 空闲连接超时（秒）
    connect_timeout: config.pg.connection_timeout, // 连接超时（秒）
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