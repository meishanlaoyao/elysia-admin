import { RedisClient } from "bun";
import config from "@/config";


const redis = new RedisClient(config.redis);

try {
    await redis.connect();
    console.log("Redis connected");
} catch (error) {
    console.error("Redis connect error:", error);
}

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
        console.error("Redis set error:", error);
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
        console.error("Redis get error:", error);
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
        console.error("Redis del error:", error);
        return false;
    }
};

/**
 * 获取匹配缓存key列表 (此操作会阻塞redis)
 * @param pattern 缓存key模式
 * @returns 缓存key列表
 */
export async function Keys(pattern: string): Promise<string[]> {
    try {
        return await redis.keys(pattern + '*');
    } catch (error) {
        console.error("Redis keys error:", error);
        return [];
    }
};