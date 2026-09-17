import { t } from 'elysia';

export const ExecuteSqlDto = {
    body: t.Object({
        sql: t.String({
            minLength: 1,
            description: 'SQL语句',
            error: 'SQL不能为空',
        }),
    }),
};