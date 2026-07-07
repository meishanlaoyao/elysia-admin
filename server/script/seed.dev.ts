import pg from '@/core/database/pg';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import config from '@/config';
import { logger } from '@/shared/logger';

/**
 * 初始化pg数据库
 */
async function initPgData() {
    try {
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

/** 开发环境：空库时执行 pg.sql 初始化 */
export async function InitSeedDevData() {
    await initPgData();
};