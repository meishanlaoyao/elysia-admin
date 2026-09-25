import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { Get, SMembers, SRem } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';
import { InvalidateUserSession } from '@/modules/system-user/handle';

export async function findList(ctx: AppContext) {
    const {
        pageNum = 1,
        pageSize = 10,
    } = ctx.query;
    const num = Number(pageNum);
    const size = Number(pageSize);
    const userIds = await SMembers(CacheEnum.ONLINE_USER_INDEX);
    const list: any[] = [];
    const ghosts: string[] = [];
    for (const userId of userIds) {
        const data = await Get(CacheEnum.ONLINE_USER + userId);
        if (!data) {
            ghosts.push(userId);
            continue;
        }
        const { roles, permissions, ...rest } = data;
        list.push(rest);
    }
    if (ghosts.length) await SRem(CacheEnum.ONLINE_USER_INDEX, ghosts);
    const total = list.length;
    const start = (num - 1) * size;
    const end = start + size;
    return BaseResultData.ok({ list: list.slice(start, end), total });
};

export async function forceLogout(ctx: AppContext) {
    const ids = ctx.params.ids.split(',').filter(Boolean);
    if (!ids.length) return BaseResultData.ok();
    for (const userId of ids) await InvalidateUserSession(userId);
    return BaseResultData.ok();
};