import config from "@/config";

export const CacheEnum = {
    /**
     * 刷新token缓存key
     */
    REFRESH_TOKEN: `${config.app.id}:refreshToken:`,
    /**
     * 用户 refresh token SET 索引（成员为完整 refresh key）
     */
    REFRESH_TOKEN_INDEX: `${config.app.id}:refreshTokenIndex:`,
    /**
     * 用户 refresh 索引已迁移标记（避免升级后反复 Keys 兜底）
     */
    REFRESH_TOKEN_INDEX_INIT: `${config.app.id}:refreshTokenIndexInit:`,
    /**
     * 已轮换作废的 refresh uuid 墓碑
     */
    REFRESH_USED: `${config.app.id}:refreshUsed:`,
    /**
     * 在线用户缓存key
     */
    ONLINE_USER: `${config.app.id}:onlineUser:`,
    /**
     * 在线用户 SET 索引（成员为 userId）
     */
    ONLINE_USER_INDEX: `${config.app.id}:onlineUserIndex`,
    /**
     * 用户权限码缓存key
     */
    USER_PERM: `${config.app.id}:userPerm:`,
    /**
     * 管理员后台菜单缓存key（实际 key = ADMIN_MENU + userId + ':' + ADMIN_MENU_VER）
     */
    ADMIN_MENU: `${config.app.id}:adminMenu:`,
    /**
     * 管理员菜单缓存全局版本号（INCR 失效全员缓存）
     */
    ADMIN_MENU_VER: `${config.app.id}:adminMenu:ver`,
    /**
     * 后台登陆账号密码错误次数缓存key
     */
    ADMIN_LOGIN_ERROR_COUNT: `${config.app.id}:adminLoginErrorCount:`,
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
    /**
     * 定时任务分布式锁
     */
    CRON_LOCK: `${config.app.id}:cronLock:`,
    /**
     * 接口ip限流
     */
    IP_RATE_LIMIT: `${config.app.id}:ipRateLimit:`,
    /**
     * 业务编号日递增序号
     */
    BIZ_NO: `${config.app.id}:bizNo:`,
};

/**
 * 业务编号前缀
 */
export const BizNoPrefix = {
    /** 订单号 */
    ORDER: 'ORD',
    /** 支付单号 */
    PAYMENT: 'PAY',
    /** 退款单号 */
    REFUND: 'REF',
} as const;

/**
 * 日志级别
 */
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
};