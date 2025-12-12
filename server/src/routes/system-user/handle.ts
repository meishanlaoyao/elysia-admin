import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import pg from '@/client/pg';
import { and, like, eq, gte, lte, desc, asc, count, inArray } from "drizzle-orm";
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
        const data = await pg.select().from(systemUserSchema).where(eq(systemUserSchema.delFlag, false));
        return BaseResultData.ok(data.map(({ password, ...item }) => ({ ...item })));
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findList(req: Context) {
    try {
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
        const limit = Number(pageSize);
        const conditions = [eq(systemUserSchema.delFlag, false)];
        if (email) conditions.push(eq(systemUserSchema.email, email));
        if (phone) conditions.push(eq(systemUserSchema.phone, phone));
        if (sex) conditions.push(eq(systemUserSchema.sex, sex));
        if (username) conditions.push(like(systemUserSchema.username, `%${username}%`));
        if (nickname) conditions.push(like(systemUserSchema.nickname, `%${nickname}%`));
        if (startTime) conditions.push(gte(systemUserSchema.createTime, new Date(startTime)));
        if (endTime) conditions.push(lte(systemUserSchema.createTime, new Date(endTime)));
        const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
        const sortFn = sortRule.toLowerCase() === "asc" ? asc : desc;

        // 查询总数
        const totalResult = await pg
            .select({ count: count() })
            .from(systemUserSchema)
            .where(whereCondition);
        const total = totalResult[0]?.count || 0;

        // 查询列表数据
        const validColumns: Record<string, any> = {
            userId: systemUserSchema.userId,
            username: systemUserSchema.username,
            nickname: systemUserSchema.nickname,
            email: systemUserSchema.email,
            phone: systemUserSchema.phone,
            sex: systemUserSchema.sex,
            avatar: systemUserSchema.avatar,
            createTime: systemUserSchema.createTime,
            updateTime: systemUserSchema.updateTime,
        };
        const orderColumn = validColumns[orderByColumn] || systemUserSchema.createTime;
        const data = await pg
            .select()
            .from(systemUserSchema)
            .where(whereCondition)
            .orderBy(sortFn(orderColumn))
            .limit(limit)
            .offset(offset);

        // 移除密码字段
        const list = data.map(({ password, ...item }) => ({ ...item }));

        return BaseResultData.ok({ list, total });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findOne(req: Context) {
    try {
        const id = Number(req.params.id);
        const data = await pg.select().from(systemUserSchema).where(and(eq(systemUserSchema.userId, id), eq(systemUserSchema.delFlag, false)));
        if (data.length === 0) return BaseResultData.fail(404);
        const { password, ...item } = data[0];
        return BaseResultData.ok(item);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(req: Context) {
    try {
        const id = Number(req.params.id);
        const data = req.body as typeof systemUserSchema.$inferSelect;
        if (data.password) data.password = BcryptHash(data.password);
        await pg.update(systemUserSchema).set(data).where(eq(systemUserSchema.userId, id));
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(req: Context) {
    try {
        const ids = req.params.ids.split(',').map(Number) as number[];
        await pg.update(systemUserSchema).set({ delFlag: true }).where(inArray(systemUserSchema.userId, ids));
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};