import { TtlCache } from '@/shared/ttl-cache';

const TTL_MS = 2000;
const cache = new TtlCache<any>();

/**
 * 获取在线用户缓存
 * @param userId 用户ID
 * @returns 在线用户信息
 */
export function GetOnlineUserL1(userId: string): any | undefined {
    return cache.get(userId);
};

/**
 * 设置在线用户缓存
 * @param userId 用户ID
 * @param user 在线用户信息
 */
export function SetOnlineUserL1(userId: string, user: any): void {
    cache.set(userId, user, TTL_MS);
};

/**
 * 删除在线用户缓存
 * @param userId 用户ID
 */
export function DeleteOnlineUserL1(userId: string): void {
    cache.delete(userId);
};