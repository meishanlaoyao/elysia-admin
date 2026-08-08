import { redis } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';
import { FormatTime } from '@/shared/time';
import { logger } from '@/shared/logger';

/** Redis key 过期时间（秒），2 天跨天缓冲 */
const BIZ_NO_TTL = 2 * 24 * 60 * 60;

/**
 * 原子 INCR + 首次 EXPIRE，避免 key 永不过期
 */
const INCR_EXPIRE_LUA = `
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return n
`;

export interface GenerateBizNoOptions {
    /** 序号最小位数，默认 6；超过时自然增长不截断 */
    seqLength?: number;
    /** 日期格式，默认 YYYYMMDD；高频场景可传 YYYYMMDDHH */
    dateFormat?: string;
};

/**
 * 生成业务编号（前缀 + 日期 + Redis 日递增序号）
 *
 * 构成示例：`ORD20260808000123`（前缀 3 + 日期 8 + 序号 6）
 *
 * 1. 按 dateFormat 取当前日期片段
 * 2. Redis Lua 原子 INCR，首次写入时设置 2 天 TTL
 * 3. 序号 padStart 后与前缀、日期拼接
 *
 * @param prefix - 业务前缀，建议使用 BizNoPrefix
 * @param options - 可选：序号位数、日期格式
 * @returns 业务编号字符串
 * @throws Redis 异常时抛出「业务编号生成失败，请稍后重试」
 */
export async function GenerateBizNo(
    prefix: string,
    options?: GenerateBizNoOptions,
): Promise<string> {
    const seqLength = options?.seqLength ?? 6;
    const dateFormat = options?.dateFormat ?? 'YYYYMMDD';
    const datePart = FormatTime(new Date(), dateFormat);
    const key = `${CacheEnum.BIZ_NO}${prefix}:${datePart}`;
    try {
        const seq = await redis.eval(INCR_EXPIRE_LUA, 1, key, String(BIZ_NO_TTL)) as number;
        const seqPart = String(seq).padStart(seqLength, '0');
        return `${prefix}${datePart}${seqPart}`;
    } catch (error) {
        logger.error(`业务编号生成失败 prefix=${prefix} key=${key} error=${error}`);
        throw new Error('业务编号生成失败，请稍后重试');
    }
};