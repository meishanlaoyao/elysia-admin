# 部署指南

## 开发环境

### 环境要求

- Bun >= 1.0
- PostgreSQL >= 12
- Redis >= 7.2
- Node.js >= 18 (可选，用于某些工具)

### 安装 Bun

**macOS/Linux**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 启动开发服务器

```bash
cd server
bun install
bun run dev
```

开发服务器会在文件变化时自动重启。

## 生产环境部署

### 方式一：编译为可执行文件

#### 1. 构建

```bash
bun run build
```

这会生成一个独立的可执行文件 `./server`，包含所有依赖。

#### 2. 运行

```bash
./server
```

#### 优点

- 单文件部署，无需安装依赖
- 启动速度快
- 体积小

### 方式二：Docker 部署

#### 1. 构建镜像

```bash
bun run docker:build
```

或手动构建：

```bash
docker build -t elysia-admin:latest .
```

#### 2. 运行容器

```bash
docker run -d \
  --name elysia-admin \
  -p 3000:3000 \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_db_password \
  -e REDIS_URL=your_redis_url \
  elysia-admin:latest
```

#### 3. 查看日志

```bash
docker logs -f elysia-admin
```

#### 4. 停止和删除

```bash
docker stop elysia-admin
docker rm elysia-admin
```

### 方式三：Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=your_password
      - DB_NAME=elysia-admin
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=your_password
      - POSTGRES_DB=elysia-admin
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass your_redis_password
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

启动所有服务：

```bash
docker-compose up -d
```

### 方式四：PM2 部署

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 创建 PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'elysia-admin',
    script: 'bun',
    args: 'run src/index.ts',
    cwd: './server',
    instances: 2,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

#### 3. 启动应用

```bash
pm2 start ecosystem.config.js
```

#### 4. 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs elysia-admin

# 重启
pm2 restart elysia-admin

# 停止
pm2 stop elysia-admin

# 删除
pm2 delete elysia-admin

# 保存配置
pm2 save

# 开机自启
pm2 startup
```

## 数据库迁移

### 开发环境

```bash
# 推送 schema 到数据库
bun run db:push

# 从数据库拉取 schema
bun run db:pull
```

### 生产环境

```bash
# 生成迁移文件
bunx drizzle-kit generate

# 执行迁移
bunx drizzle-kit migrate
```

## 环境变量配置

### 创建 .env 文件

```bash
# 应用配置
APP_ID=elysia-admin
APP_PORT=3000
APP_PREFIX=/api

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=elysia-admin
DB_MAX_CONNECTIONS=20
DB_SSL=false

# Redis 配置
REDIS_URL=redis://localhost:6379

# JWT 配置（如果使用）
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 在代码中使用

修改 `src/config/index.ts`：

```typescript
export default {
    app: {
        id: process.env.APP_ID || "Elysia-Admin",
        port: Number(process.env.APP_PORT) || 3000,
        prefix: process.env.APP_PREFIX || "/api",
    },
    pg: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'elysia-admin',
        max: Number(process.env.DB_MAX_CONNECTIONS) || 20,
        ssl: process.env.DB_SSL === 'true',
    },
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
};
```

## Nginx 反向代理

### 配置示例

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}
```

## 性能优化

### 1. 数据库连接池

调整 `config.pg.max` 根据服务器资源：

```typescript
pg: {
    max: 50,  // 增加连接池大小
    idle_timeout: 30,
    connect_timeout: 10,
}
```

### 2. Redis 缓存

使用 Redis 缓存热点数据：

```typescript
import redis from '@/client/redis';

// 缓存查询结果
const cacheKey = `user:${id}`;
let user = await redis.get(cacheKey);

if (!user) {
    user = await FindOneByKey(userSchema, userSchema.id, id);
    await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600);
} else {
    user = JSON.parse(user);
}
```

### 3. 关闭生产环境文档

在 `src/index.ts` 中注释掉 OpenAPI：

```typescript
// 生产环境注释掉
// import { openapi } from '@elysiajs/openapi';
// app.use(openapi({ ... }));
```

### 4. 启用 Gzip 压缩

在 Nginx 中启用：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## 监控和日志

### 1. 应用日志

使用结构化日志：

```typescript
import { GetNowTime } from '@/common/time';

console.log(`[${GetNowTime()}] [INFO] 用户登录: ${username}`);
console.error(`[${GetNowTime()}] [ERROR] 数据库错误:`, error);
```

### 2. PM2 监控

```bash
# 实时监控
pm2 monit

# Web 监控面板
pm2 web
```

### 3. Docker 日志

```bash
# 查看日志
docker logs -f elysia-admin

# 限制日志大小
docker run --log-opt max-size=10m --log-opt max-file=3 ...
```

## 安全建议

1. **修改默认密码**: 生产环境必须修改所有默认密码
2. **使用环境变量**: 敏感信息不要硬编码
3. **启用 HTTPS**: 使用 SSL/TLS 加密传输
4. **限制访问**: 使用防火墙限制数据库和 Redis 访问
5. **定期备份**: 定期备份数据库
6. **更新依赖**: 定期更新依赖包修复安全漏洞
7. **关闭文档**: 生产环境关闭 OpenAPI 文档
8. **日志脱敏**: 日志中不要记录敏感信息

## 故障排查

### 数据库连接失败

```bash
# 检查数据库是否运行
pg_isready -h localhost -p 5432

# 测试连接
psql -h localhost -U postgres -d elysia-admin
```

### Redis 连接失败

```bash
# 检查 Redis 是否运行
redis-cli ping

# 测试连接
redis-cli -h localhost -p 6379
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 查看应用日志

```bash
# PM2
pm2 logs elysia-admin

# Docker
docker logs elysia-admin

# 直接运行
bun run dev
```
