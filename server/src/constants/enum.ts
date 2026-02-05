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
    /**
     * 字典所有类型
     */
    DICT_TYPE: `${config.app.id}:dictType`,
    /**
     * 字典类型数据
     */
    DICT_DATA: `${config.app.id}:dictData:`,
    /**
     * 忘记密码
     */
    FORGET_PASSWORD: `${config.app.id}:forgetPassword:`,
    /**
     * 熔断的api
     */
    FALLBACK_API: `${config.app.id}:fallbackApi:`,
    /**
     * 系统IP黑名单
     */
    IP_BLACK: `${config.app.id}:ipBlack`,
    /**
     * 缓存的下拉选项数据
     */
    BASE_OPTIONS: `${config.app.id}:baseOptions:`,
};

/**
 * 日志级别
 */
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
};