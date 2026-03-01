// 该文件自动生成，请勿手动修改
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './database/drizzle',
    schema: './database/schema/*.ts',
    dialect: 'postgresql',
    dbCredentials: {
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "123456",
        database: "elysia-admin",
        ssl: false,
    }
});