## 功能
- api 表，记录所有的 api接口
- 黑名单表，可以设置一些或全部 api接口 不允许访问

## 软件依赖
 - [bun](https://bun.sh/)
 - [pm2](https://pm2.keymetrics.io/)
 - [redis 5+](https://redis.io/)
 - [postgresql 17+](https://www.postgresql.org/)

## 部署
### PM2部署
1. 构建项目
```bash
bun run build
```
2. 启动项目
```bash
pm2 start dist/ecosystem.config.cjs
```

### 裸JS部署
1. 构建项目
```bash
bun run build
```
2. 启动项目
注意：
 - $env:NODE_ENV="production";这种写法只能临时设置一次PowerShell的值。如果想切换成开发环境，需要打开新的PowerShell窗口。
```bash
# windows
$env:NODE_ENV="production"; bun run dist/index.js

# linux
NODE_ENV=production bun run dist/index.js
```

### Docker部署