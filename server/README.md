## 软件依赖
 - [bun 1.2.21+](https://bun.sh/)
 - [pm2](https://pm2.keymetrics.io/)
 - [redis 6+](https://redis.io/)
 - [postgresql 16+](https://www.postgresql.org/)

## 运行项目
1. 安装依赖
```bash
bun install
```
2. 运行项目
```bash
bun dev
```

## 部署

### 普通 js 部署
1. 构建项目
```bash
bun run build
```

2. 启动项目
```bash
# 普通启动
bun run start

# pm2 启动（主进程 + Worker）
pm2 start dist/ecosystem.config.cjs
```

### docker 部署

## 查看监控
```bash
# 查看监控
pm2 monit
```

## 文件服务
如果没有使用云存储，本地文件服务可以使用 [RustFS](https://docs.rustfs.com.cn/installation/docker/) 来提供文件存储服务。
### 使用Docker安装RustFS
```bash
docker run -d --name rustfs_container --user root -p 9000:9000 -p 9001:9001 -v /mnt/rustfs/data:/data -e RUSTFS_ACCESS_KEY=rustfsadmin -e RUSTFS_SECRET_KEY=rustfsadmin -e RUSTFS_CONSOLE_ENABLE=true rustfs/rustfs:latest --address :9000 --console-enable --access-key rustfsadmin --secret-key rustfsadmin /data
```