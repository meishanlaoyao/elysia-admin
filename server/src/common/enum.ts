import config from "@/config";

export const CacheEnum = {
    /**
     * 刷新token缓存key
     */
    REFRESH_TOKEN: `${config.app.id}:refreshToken:`,
    /**
     * 在线用户缓存key
     */
    ONLINE_USER: `${config.app.id}:onlineUser:`,
};