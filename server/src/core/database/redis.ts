import Redis from "ioredis";
import config from "@/config";
import { logger } from "@/shared/logger";

// 使用 globalThis 确保跨模块单例
declare global {
    var __redisInstance: Redis | undefined;
    var __redisConnected: boolean | undefined;
}

function getRedisInstance(): Redis {
    if (!globalThis.__redisInstance) {
        globalThis.__redisInstance = new Redis({
            ...config.redis,
            // 连接池配置
            maxRetriesPerRequest: 3, // 每个请求最大重试次数
            enableReadyCheck: true, // 启用就绪检查
            enableOfflineQueue: true, // 启用离线队列
            connectTimeout: 10000, // 连接超时 10秒
            // 性能优化
            lazyConnect: false, // 立即连接
            keepAlive: 30000, // 保持连接 30秒
        });
        globalThis.__redisConnected = false;

        // 只注册一次事件监听器
        globalThis.__redisInstance.once("connect", () => {
            logger.info("Redis 连接成功");
            globalThis.__redisConnected = true;
        });

        globalThis.__redisInstance.on("error", (error) => {
            logger.error("Redis 连接失败", { error: error.message });
        });

        globalThis.__redisInstance.on("close", () => {
            globalThis.__redisConnected = false;
        });
    }
    return globalThis.__redisInstance;
}

const redis = getRedisInstance();

// 优雅关闭 Redis 连接
process.on('SIGINT', async () => {
    logger.info('正在关闭 Redis 连接...');
    await redis.quit();
    logger.info('Redis 连接已关闭');
});

process.on('SIGTERM', async () => {
    logger.info('正在关闭 Redis 连接...');
    await redis.quit();
    logger.info('Redis 连接已关闭');
});

/**
 * 设置缓存
 * @param key 缓存key
 * @param value 缓存值
 * @param expire 过期时间（单位秒）
 * @returns 是否设置成功
 */
export async function Set(key: string, value: any, expire?: number): Promise<boolean> {
    try {
        value = JSON.stringify(value);
        await redis.set(key, value);
        if (expire) {
            await redis.expire(key, expire);
        };
        return true;
    } catch (error) {
        logger.error("Redis set error:" + error);
        return false;
    }
};

/**
 * 批量设置缓存
 * @param items 缓存项数组，每个项包含key、value和可选的expire
 * @returns 是否全部设置成功
 */
export async function SetMulti(items: Array<{ key: string, value: any, expire?: number }>): Promise<boolean> {
    try {
        const pipeline = redis.pipeline();
        for (const item of items) {
            const value = JSON.stringify(item.value);
            pipeline.set(item.key, value);
            if (item.expire) {
                pipeline.expire(item.key, item.expire);
            }
        };
        await pipeline.exec();
        return true;
    } catch (error) {
        logger.error("Redis set multi error:" + error);
        return false;
    }
};

/**
 * 获取缓存
 * @param key 缓存key
 * @returns 缓存值
 */
export async function Get(key: string): Promise<any> {
    try {
        const value = await redis.get(key);
        if (value) return JSON.parse(value);
        return null;
    } catch (error) {
        logger.error("Redis get error:" + error);
        return null;
    }
};

/**
 * 删除缓存 (支持批量删除)
 * @param key 缓存key
 * @returns 是否删除成功
 */
export async function Del(key: string | string[]): Promise<boolean> {
    try {
        if (Array.isArray(key)) {
            await redis.del(...key);
        } else {
            await redis.del(key);
        };
        return true;
    } catch (error) {
        logger.error("Redis del error:" + error);
        return false;
    }
};

/**
 * 获取匹配缓存key列表 (使用scan非阻塞方式)
 * @param pattern 缓存key模式
 * @returns 缓存key列表
 */
export async function Keys(pattern: string): Promise<string[]> {
    try {
        const keys: string[] = [];
        let cursor = '0';

        do {
            const [nextCursor, matchedKeys] = await redis.scan(
                cursor,
                'MATCH',
                pattern + '*',
                'COUNT',
                100
            );
            cursor = nextCursor;
            keys.push(...matchedKeys);
        } while (cursor !== '0');

        return keys;
    } catch (error) {
        logger.error("Redis keys error:" + error);
        return [];
    }
};