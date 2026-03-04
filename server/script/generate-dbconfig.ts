import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import config from "@/config";
import { logger } from '@/shared/logger';

const type = Bun.argv[2] as 'push' | 'pull';
const command = `bun drizzle-kit ${type}`;
const { pg } = config;

const drizzleConfig = `// 该文件自动生成，请勿手动修改
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './database/drizzle',
    schema: './database/schema/*.ts',
    dialect: 'postgresql',
    dbCredentials: {
        host: "${pg.host}",
        port: ${pg.port},
        user: "${pg.user}",
        password: "${pg.password}",
        database: "${pg.database}",
        ssl: ${pg.ssl},
    }
});`;
writeFileSync(join(__dirname, '../drizzle.config.ts'), drizzleConfig, 'utf-8');
const result = Bun.spawnSync(command.split(' '));
if (result.exitCode !== 0) {
    logger.error('数据库迁移失败');
    process.exit(1);
};
logger.info('✓ 数据库迁移完成');