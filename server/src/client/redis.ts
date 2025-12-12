import { RedisClient } from "bun";
import config from "@/config";


const redis = new RedisClient(config.redis);

try {
    await redis.connect();
    console.log("Redis connected");
} catch (error) {
    console.log("Redis connect error:", error);
}