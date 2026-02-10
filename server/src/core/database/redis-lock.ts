import { redis } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';
import { logger } from '@/shared/logger';
import { GenerateUUID } from '@/shared/uuid';

/**
 * Redis 分布式锁
 */
export class RedisLock {
    private lockKey: string;
    private lockValue: string;
    private ttl: number;

    constructor(lockName: string, ttl: number = 300) {
        this.lockKey = `${CacheEnum.CRON_LOCK}${lockName}`;
        this.lockValue = GenerateUUID();
        this.ttl = ttl;
    }

    /**
     * 检查锁是否存在
     */
    async exists(): Promise<boolean> {
        try {
            const result = await redis.exists(this.lockKey);
            return result === 1;
        } catch (error: any) {
            logger.error(`检查锁存在性异常 [${this.lockKey}]:`, error);
            return false;
        }
    }

    /**
     * 尝试获取锁
     */
    async acquire(): Promise<boolean> {
        try {
            const result = await redis.set(
                this.lockKey,
                this.lockValue,
                'EX',
                this.ttl,
                'NX'
            );
            return result === 'OK';
        } catch (error: any) {
            logger.error(`Redis锁获取异常 [${this.lockKey}]:`, error);
            return false;
        }
    }

    /**
     * 释放锁（Lua脚本保证原子性）
     */
    async release(): Promise<boolean> {
        try {
            const script = `
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
            `;
            const result = await redis.eval(script, 1, this.lockKey, this.lockValue);
            return result === 1;
        } catch (error: any) {
            logger.error(`Redis锁释放异常 [${this.lockKey}]:`, error);
            return false;
        }
    }
};