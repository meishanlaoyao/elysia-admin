import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import pg from '@/client/pg';
import { and, like, eq, gte, lte, desc, asc } from "drizzle-orm";
import { systemUserSchema } from '@/schema/system_user';
import { BcryptHash } from '@/common/bcrypt';

export async function create(req: Context) {
    try {
        const data = req.body as typeof systemUserSchema.$inferInsert;
        data.password = BcryptHash(data.password);
        await pg.insert(systemUserSchema).values(data);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findAll() {
    try {
        const data = await pg.select().from(systemUserSchema);
        return BaseResultData.ok(data.map(({ password, ...item }) => ({ ...item })));
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findList(req: Context) {
    const {
        pageNum = 1,
        pageSize = 10,
        orderByColumn = "createTime",
        sortRule = "desc",
        startTime,
        endTime,
        username,
        nickname,
        email,
        phone,
        sex
    } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const limit = pageSize;
    const conditions = [];
    if (email) conditions.push(eq(systemUserSchema.email, email));
    if (phone) conditions.push(eq(systemUserSchema.phone, phone));
    if (sex) conditions.push(eq(systemUserSchema.sex, sex));
    if (username) conditions.push(like(systemUserSchema.username, `%${username}%`));
    if (nickname) conditions.push(like(systemUserSchema.nickname, `%${nickname}%`));
    if (startTime) conditions.push(gte(systemUserSchema.createTime, new Date(startTime)));
    if (endTime) conditions.push(lte(systemUserSchema.createTime, new Date(endTime)));
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    const sortFn = sortRule.toLowerCase() === "asc" ? asc : desc;



    return BaseResultData.ok();
};

export async function findOne(req: Context) {
    return BaseResultData.ok();
};

export async function update(req: Context) {
    return BaseResultData.ok();
};

export async function remove(req: Context) {
    return BaseResultData.ok();
};