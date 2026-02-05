/**
 * 客户端类型
 */
export type IClientType = 'web' | 'app' | 'miniapp' | 'desktop' | 'unknown';

/**
 * 应用生态平台
 */
export type IClientPlatform =
    // 社交/内容平台
    | 'wechat' | 'qq' | 'weibo' | 'douyin' | 'xiaohongshu'
    // 电商平台
    | 'alipay' | 'taobao' | 'jd' | 'pinduoduo'
    // 搜索/信息平台
    | 'baidu'
    // 浏览器
    | 'chrome' | 'safari' | 'firefox' | 'edge' | 'opera'
    | 'uc' | 'qq-browser' | 'quark' | 'sogou' | '360-browser'
    // 其他
    | 'native' | 'unknown';

/**
 * 请求方法
 */
export type IRequestMethod = 'get' | 'post' | 'put' | 'delete';

/**
 * 账号人员类型
 */
export type IAccountType = 'admin' | 'user' | 'anonymous';