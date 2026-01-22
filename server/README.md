## 功能
- api 表，记录所有的 api接口
- 黑名单表，可以设置一些或全部 api接口 不允许访问

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
```bash
# windows
$env:NODE_ENV="production"; bun run dist/index.js

# linux
NODE_ENV=production bun run dist/index.js
```

### Docker部署