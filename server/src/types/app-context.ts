import type { Context } from 'elysia';
import type { IRouteMeta } from '@/types/route';

/** 由 middleware/analysis 挂载到 Context */
export interface RuntimeRouteInfo {
    tags: string;
    summary: string;
    meta?: IRouteMeta;
};

/**
 * 在线用户（Redis 反序列化；字段以实际写入为准，可逐步收紧）
 */
export type OnlineUser = {
    userId?: number | string;
    permissions?: string[];
    [key: string]: unknown;
};

/**
 * 项目在中间件里挂到 Context 上的运行时字段。
 * Elysia 1.4 的 `Context` 为 `type`，无法用 `.d.ts` 做 interface merge，故用交集类型。
 */
export type AppContext = Context & {
    routeKey?: string;
    routeInfo?: RuntimeRouteInfo;
    user?: OnlineUser | null;
    clientInfo?: Record<string, unknown>;
    startTime?: number;
    ip?: string;
    response?: unknown;
};