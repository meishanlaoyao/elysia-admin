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
};