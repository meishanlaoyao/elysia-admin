import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import config from '@/config';

const client = postgres(config.pg);
const pg = drizzle(client);
export default pg;