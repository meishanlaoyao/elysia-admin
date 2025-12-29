export default {
    app: {
        id: "Elysia-Admin", // 应用ID (如果一台服务器部署了多个本项目，强烈建议为每个项目指定不同的ID)
        port: 3000, // 端口
        lang: "zh", // 应用语言
        prefix: "/api", // API 前缀
        baseCacheTime: 5 * 60, // 基础缓存时间 5分钟
        forgetPasswordExpiresIn: 10 * 60, // 忘记密码过期时间 10分钟
        forgetPasswordUrl: 'http://192.168.2.112:3006/#/auth/reset-password', // 忘记密码重置URL
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
        host: 'localhost', // redis 主机
        port: 6379, // redis 端口
        password: '', // redis 密码
        username: '', // redis 用户名
        db: 0, // redis 数据库编号
    },
    pg: {
        host: 'localhost', // 数据库主机
        port: 5432, // 数据库端口
        username: 'postgres', // 数据库用户名
        user: 'postgres', // 数据库用户名
        password: '123456', // 数据库密码
        database: 'elysia-admin', // 数据库名称
        max: 20, // 最大连接数
        idle_timeout: 20, // 空闲连接超时时间 (秒)
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
};