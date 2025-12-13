export default {
    app: {
        id: "Elysia-Admin", // 应用ID (如果一台服务器部署了多个本项目，强烈建议为每个项目指定不同的ID)
        port: 3000, // 端口
        lang: "zh", // 应用语言
        prefix: "/api", // API 前缀
        baseCacheTime: 5 * 60 * 1000, // 基础缓存时间 5分钟
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

    },
    redis: "redis://default:K0HU5zEBgwnxzNZt7etbLVYK6MdpBLaz@redis-12340.c74.us-east-1-4.ec2.cloud.redislabs.com:12340", // redis://username:password@host:port
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
}