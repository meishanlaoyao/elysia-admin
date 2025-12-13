# 常见问题

## 设计理念

### 为什么不使用日志文件？

项目默认没有集成日志文件系统，主要考虑以下几点：

**磁盘空间管理**
- 日志文件会持续增长，占用大量磁盘空间
- 需要定期清理和归档，增加运维复杂度
- 对于小型项目或开发环境，日志文件可能是不必要的负担

**灵活性**
- 不同项目对日志的需求差异很大
- 有些项目需要详细的调试日志，有些只需要错误日志
- 让开发者根据实际需求选择合适的日志方案

**控制台输出**
- 开发环境使用 `console.log` 已经足够
- 生产环境可以通过 Docker 日志或进程管理工具（如 PM2）查看日志
- 云服务通常提供日志收集服务（如 CloudWatch、阿里云日志服务）

**如何集成日志系统？**

如果你需要日志文件，可以轻松集成流行的日志库：

#### 使用 Pino（推荐）

```bash
bun add pino pino-pretty
```

```typescript
// src/common/logger.ts
import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

// 在代码中使用
logger.info('用户登录成功', { userId: 1 });
logger.error('数据库连接失败', error);
```

#### 使用 Winston

```bash
bun add winston
```

```typescript
// src/common/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

---

### 为什么推荐使用 S3 而不是本地存储？

项目推荐使用 S3（对象存储）来存储文件，而不是本地文件系统，原因如下：

**服务器资源优化**
- 本地存储会占用服务器磁盘空间
- 文件上传会消耗服务器带宽和 CPU
- 大量文件会影响服务器性能和备份效率

**可扩展性**
- 本地存储难以水平扩展
- 多服务器部署时，文件同步是个难题
- S3 提供几乎无限的存储空间

**成本效益**
- S3 存储成本通常低于服务器磁盘
- 按需付费，不需要预留大量磁盘空间
- 减少服务器配置要求，降低整体成本

**可靠性和安全性**
- S3 提供 99.999999999%（11 个 9）的数据持久性
- 自动备份和容灾
- 内置 CDN 加速，全球访问更快
- 细粒度的访问控制

**开发便利性**
- 统一的 API 接口
- 支持直传，减轻服务器压力
- 自动生成临时访问链接
- 图片处理、视频转码等增值服务

**支持的 S3 服务**

项目可以使用任何兼容 S3 协议的对象存储服务：

- **AWS S3** - 最成熟的对象存储服务
- **阿里云 OSS** - 国内访问速度快
- **腾讯云 COS** - 性价比高
- **七牛云** - 免费额度大
- **MinIO** - 开源自建方案

**如何集成 S3？**

#### 安装 SDK

```bash
bun add @aws-sdk/client-s3
```

#### 配置 S3

```typescript
// src/config/index.ts
export default {
  s3: {
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
    },
    bucket: process.env.S3_BUCKET || 'my-bucket'
  }
}
```

#### 创建 S3 客户端

```typescript
// src/client/s3.ts
import { S3Client } from '@aws-sdk/client-s3';
import config from '@/config';

export const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: config.s3.credentials
});
```

#### 上传文件示例

```typescript
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/client/s3';
import config from '@/config';

export async function uploadFile(file: File, key: string) {
  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    Body: await file.arrayBuffer(),
    ContentType: file.type
  });

  await s3Client.send(command);
  
  return {
    url: `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${key}`,
    key
  };
}
```

**如果确实需要本地存储？**

如果你的项目规模较小，或者有特殊需求必须使用本地存储，可以这样实现：

```typescript
// src/common/upload.ts
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function saveFileLocally(file: File, filename: string) {
  const uploadDir = join(process.cwd(), 'uploads');
  
  // 确保上传目录存在
  await mkdir(uploadDir, { recursive: true });
  
  const filepath = join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  
  await writeFile(filepath, buffer);
  
  return {
    path: filepath,
    url: `/uploads/${filename}`
  };
}
```

但请注意：
- 需要配置静态文件服务
- 需要定期备份上传目录
- 多服务器部署时需要共享存储（如 NFS）
- 需要自己实现文件清理机制

---

## 其他问题

### 为什么选择 Bun 而不是 Node.js？

- **性能**: Bun 比 Node.js 快 3-4 倍
- **内置工具**: 集成了包管理器、测试运行器、打包工具
- **兼容性**: 完全兼容 Node.js API
- **开发体验**: 启动速度快，热重载更快

### 为什么选择 Drizzle ORM？

- **类型安全**: 完整的 TypeScript 支持
- **性能**: 接近原生 SQL 的性能
- **轻量**: 体积小，无运行时开销
- **灵活**: 支持原生 SQL 查询
- **迁移**: 简单的数据库迁移管理

### 为什么使用软删除？

- **数据安全**: 防止误删除
- **审计追踪**: 保留历史记录
- **数据恢复**: 可以轻松恢复删除的数据
- **合规要求**: 某些行业要求保留所有数据

### 如何切换到硬删除？

如果你不需要软删除，可以直接使用物理删除：

```typescript
// 替换 SoftDeleteByKeys
await pg.delete(schema).where(inArray(schema.id, ids));
```

### 项目支持哪些数据库？

目前项目配置为 PostgreSQL，但 Drizzle ORM 支持：
- PostgreSQL
- MySQL
- SQLite

只需修改配置和连接即可切换。

### 如何添加身份认证？

项目没有内置身份认证，你可以集成：

- **JWT**: 使用 `@elysiajs/jwt`
- **Session**: 使用 `@elysiajs/cookie`
- **OAuth**: 集成第三方登录

示例：

```bash
bun add @elysiajs/jwt
```

```typescript
import { jwt } from '@elysiajs/jwt';

app.use(jwt({
  name: 'jwt',
  secret: 'your-secret-key'
}));
```

### 如何启用 CORS？

```bash
bun add @elysiajs/cors
```

```typescript
import { cors } from '@elysiajs/cors';

app.use(cors());
```

### 生产环境建议

1. **关闭 OpenAPI 文档**: 注释掉 `src/index.ts` 中的 OpenAPI 配置
2. **使用环境变量**: 不要在代码中硬编码敏感信息
3. **启用 HTTPS**: 使用 Nginx 反向代理
4. **配置日志**: 集成日志系统
5. **监控告警**: 使用 APM 工具
6. **定期备份**: 自动备份数据库
7. **限流保护**: 防止 API 滥用

---

## 需要帮助？

- 查看 [Elysia 文档](https://elysiajs.com/)
- 查看 [Drizzle ORM 文档](https://orm.drizzle.team/)
- 提交 [Gitee Issue](https://gitee.com/nian-qian/elysia-admin/issues)