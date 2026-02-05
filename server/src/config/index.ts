export default {
    app: {
        id: "Elysia-Admin", // 应用ID (如果一台服务器部署了多个本项目，强烈建议为每个项目指定不同的ID，另外建议使用英文命名)
        port: 3000, // 端口
        lang: "zh", // 应用语言
        prefix: "/api", // API 前缀
        baseCacheTime: 5 * 60, // 基础缓存时间 5分钟
        forgetPasswordExpiresIn: 10 * 60, // 忘记密码过期时间 10分钟
        forgetPasswordUrl: 'http://192.168.2.112:3006/#/auth/reset-password', // 忘记密码重置URL
        maxRequestBodySize: 10 * 1024 * 1024, // 最大请求体大小 10MB
        timeout: 30, // 服务端超时时间 30秒
    },
    jwt: {
        accessToken: {
            expiresIn: '15m',// accessToken 过期时间
            secret: 'elysia-admin-accessToken',// accessToken 密钥
        },
        refreshToken: {
            expiresIn: '7d',// refreshToken 过期时间
            secret: 'elysia-admin-refreshToken',// refreshToken 密钥
        }
    },
    s3: {
        endPoint: '',
        port: 9000,
        useSSL: false,
        accessKey: 'minioadmin',
        secretKey: 'minioadmin',
    },
    redis: {
        host: 'localhost', // 主机
        port: 6379, // 端口
        password: '', // 密码
        username: '', // 用户名
        db: 0, // 数据库编号
    },
    pg: {
        host: 'localhost', // 主机
        port: 5432, // 端口
        username: 'postgres', // 用户名
        user: 'postgres', // 用户名
        password: '123456', // 密码
        database: 'elysia-admin', // 名称
        max: 10, // 最大连接数（避免过多连接占用内存）
        idle_timeout: 30, // 空闲连接超时时间 30秒（更快释放空闲连接）
        connect_timeout: 10, // 连接超时时间 (秒)
        ssl: false, // 是否启用 SSL 连接
    },
    smtp: {
        host: 'smtp.qq.com', // SMTP 主机
        port: 465, // SMTP 端口
        secure: true, // 是否启用 SSL 连接
        auth: {
            user: '1360658549@qq.com', // 发送者邮箱
            pass: 'bvzlpapgzlcthhjd', // 发送者邮箱密码
        },
        pool: true, // 是否启用连接池
        maxConnections: 10, // 最大连接数
        maxMessages: 100, // 每个连接最大消息数
        rateDelta: 1000, // 速率限制时间窗口（毫秒）
        rateLimit: 5, // 时间窗口内最多发送邮件数
    },
    guard: {
        ipBlacklist: true, // 是否启用IP黑名单
        apiSwitch: true, // 是否启用api开关
    }
};