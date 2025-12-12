import { defineConfig } from 'drizzle-kit';
import config from '@/config';

export default defineConfig({
    out: './drizzle',
    schema: './src/schema/*.ts',
    dialect: 'postgresql',
    dbCredentials: config.pg
});