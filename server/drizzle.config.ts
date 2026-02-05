import { defineConfig } from 'drizzle-kit';
import config from '@/config';

export default defineConfig({
    out: './database/drizzle',
    schema: './database/schema/*.ts',
    dialect: 'postgresql',
    dbCredentials: config.pg
});