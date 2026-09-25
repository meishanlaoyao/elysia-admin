import Redis from "ioredis";
import config from "@/config";
import { logger } from "@/shared/logger";
import { IsStringifiedObjectOrArray } from "@/core/function";

// 使用 globalThis 确保跨模块单例
declare global {
    var __redisInstance: Redis | undefined;
    var __redisConnected: boolean | undefined;
};

function getRedisInstance(): Redis {
    if (!globalThis.__redisInstance) {
        globalThis.__redisInstance = new Redis({
            ...config.redis,
            // 连接池配置
            maxRetriesPerRequest: 3, // 每个请求最大重试次数
            enableReadyCheck: true, // 启用就绪检查
            enableOfflineQueue: true, // 启用离线队列
            connectTimeout: 10000, // 连接超时 10秒
            // 启动编排显式 ConnectRedis；禁止模块加载即拨号
            lazyConnect: true,
            keepAlive: 30000, // 保持连接 30秒
        });
        globalThis.__redisConnected = false;

        // 只注册一次事件监听器
        globalThis.__redisInstance.once("connect", () => {
            globalThis.__redisConnected = true;
        });

        globalThis.__redisInstance.on("error", (error) => {
            logger.error("Redis 连接失败" + error);
        });

        globalThis.__redisInstance.on("close", () => {
            globalThis.__redisConnected = false;
        });
    };
    return globalThis.__redisInstance;
};

const redis = getRedisInstance();
export { redis };

/**
 * 显式连接 Redis（须在 CreateApp / listen 之前调用）
 * @throws 连接失败时抛出含中文说明的 Error
 */
export async function ConnectRedis(): Promise<void> {
    const client = getRedisInstance();
    if (client.status === 'ready') {
        globalThis.__redisConnected = true;
        return;
    }
    try {
        if (client.status === 'wait' || client.status === 'end' || client.status === 'close') {
            await client.connect();
        } else if (client.status === 'connecting' || client.status === 'reconnecting' || client.status === 'connect') {
            await new Promise<void>((resolve, reject) => {
                if (client.status === 'ready') {
                    resolve();
                    return;
                }
                const onReady = () => {
                    cleanup();
                    resolve();
                };
                const onError = (err: Error) => {
                    cleanup();
                    reject(err);
                };
                const cleanup = () => {
                    client.off('ready', onReady);
                    client.off('error', onError);
                };
                client.once('ready', onReady);
                client.once('error', onError);
            });
        } else {
            await client.connect();
        }
        globalThis.__redisConnected = true;
        logger.info('Redis 连接成功');
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new Error(`Redis 连接失败，请检查 redis 配置与服务状态：${detail}`);
    }
};

/**
 * 关闭 Redis 连接
 * @returns 关闭 Redis 连接
 */
export async function quitRedis(): Promise<void> {
    if (!globalThis.__redisInstance) return;
    try {
        logger.info('正在关闭 Redis 连接...');
        await globalThis.__redisInstance.quit();
        logger.info('Redis 连接已关闭');
    } catch (error) {
        logger.error('Redis 关闭异常' + error);
    };
};

/**
 * 设置缓存
 * @param key 缓存key
 * @param value 缓存值
 * @param expire 过期时间（单位秒）
 * @returns 是否设置成功
 */
export async function Set(key: string, value: any, expire?: number): Promise<boolean> {
    try {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (expire != null && expire > 0) {
            await redis.set(key, serializedValue, 'EX', expire);
        } else {
            // Redis 6.0+ 特性
            await redis.set(key, serializedValue, 'KEEPTTL');
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
        const value = await redis.get(key) || '';
        if (IsStringifiedObjectOrArray(value)) return JSON.parse(value);
        return value || null;
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
            if (!key.length) return true;
            for (let i = 0; i < key.length; i += 500) {
                await redis.del(...key.slice(i, i + 500));
            }
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
 * 异步删除键（分块 UNLINK，适合大批量，避免单次 DEL 阻塞）
 * @param key 缓存key或key数组
 * @returns 是否删除成功
 */
export async function Unlink(key: string | string[]): Promise<boolean> {
    try {
        const keys = Array.isArray(key) ? key : [key];
        if (!keys.length) return true;
        for (let i = 0; i < keys.length; i += 500) {
            await redis.unlink(...keys.slice(i, i + 500));
        }
        return true;
    } catch (error) {
        logger.error("Redis unlink error:" + error);
        return false;
    }
};

/**
 * 判断 key 是否存在
 * @param key 缓存key
 * @returns 是否存在
 */
export async function Exists(key: string): Promise<boolean> {
    try {
        return (await redis.exists(key)) === 1;
    } catch (error) {
        logger.error("Redis exists error:" + error);
        return false;
    }
};

/**
 * SET 集合添加成员；可选刷新集合 TTL
 * @param key 集合key
 * @param member 成员（支持多个）
 * @param expire 可选过期时间（秒），写入后设置/刷新 TTL
 * @returns 是否成功
 */
export async function SAdd(key: string, member: string | string[], expire?: number): Promise<boolean> {
    try {
        const members = Array.isArray(member) ? member : [member];
        if (!members.length) return true;
        await redis.sadd(key, ...members);
        if (expire != null && expire > 0) await redis.expire(key, expire);
        return true;
    } catch (error) {
        logger.error("Redis sadd error:" + error);
        return false;
    }
};

/**
 * SET 集合移除成员
 * @param key 集合key
 * @param member 成员（支持多个）
 * @returns 是否成功
 */
export async function SRem(key: string, member: string | string[]): Promise<boolean> {
    try {
        const members = Array.isArray(member) ? member : [member];
        if (!members.length) return true;
        await redis.srem(key, ...members);
        return true;
    } catch (error) {
        logger.error("Redis srem error:" + error);
        return false;
    }
};

/**
 * 获取 SET 全部成员
 * @param key 集合key
 * @returns 成员列表
 */
export async function SMembers(key: string): Promise<string[]> {
    try {
        return await redis.smembers(key);
    } catch (error) {
        logger.error("Redis smembers error:" + error);
        return [];
    }
};

/**
 * SET 成员数量
 * @param key 集合key
 * @returns 数量
 */
export async function SCard(key: string): Promise<number> {
    try {
        return await redis.scard(key);
    } catch (error) {
        logger.error("Redis scard error:" + error);
        return 0;
    }
};

/**
 * 原子自增
 * @param key 缓存key
 * @returns 自增后的值；失败返回 null
 */
export async function Incr(key: string): Promise<number | null> {
    try {
        return await redis.incr(key);
    } catch (error) {
        logger.error("Redis incr error:" + error);
        return null;
    }
};

/**
 * 按前缀扫描匹配的 key 列表（全库 SCAN，共享大库下很慢）
 * 仅供运维缓存监控等低频场景；业务热路径禁止调用。
 * @param pattern 缓存key前缀（函数会追加 `*`）
 * @returns 缓存key列表
 */
export async function Keys(pattern: string): Promise<string[]> {
    try {
        const keys: string[] = [];
        let cursor = '0';
        const match = pattern.endsWith('*') ? pattern : pattern + '*';

        do {
            const [nextCursor, matchedKeys] = await redis.scan(
                cursor,
                'MATCH',
                match,
                'COUNT',
                1000
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