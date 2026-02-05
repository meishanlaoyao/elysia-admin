# 项目目录结构

```
elysia-admin/
├── .gitignore                           # Git 忽略配置文件
├── bun.lock                             # Bun 依赖锁定文件
├── Dockerfile                           # Docker 镜像构建配置
├── drizzle.config.ts                    # Drizzle ORM 配置文件
├── package.json                         # 项目配置和依赖管理
├── README.md                            # 项目说明文档
├── tsconfig.json                        # TypeScript 编译配置
│
├── database/                            # 数据库定义层
│   ├── base-schema.ts                   # 基础字段定义（通用字段：createTime、updateTime、delFlag 等）
│   ├── drizzle/                         # Drizzle ORM 迁移文件
│   │   ├── 0000_orange_khan.sql         # 数据库迁移 SQL 文件
│   │   ├── relations.ts                 # 表关系定义
│   │   ├── schema.ts                    # Drizzle 生成的 schema
│   │   └── meta/                        # 迁移元数据目录
│   ├── schema/                          # 业务表 Schema 定义
│   │   ├── system_api.ts                # API 接口表 Schema
│   │   ├── system_dept.ts               # 部门表 Schema
│   │   ├── system_dict.ts               # 字典表 Schema
│   │   ├── system_ip_black.ts           # IP 黑名单表 Schema
│   │   ├── system_login_log.ts          # 登录日志表 Schema
│   │   ├── system_menu.ts               # 菜单表 Schema
│   │   ├── system_oper_log.ts           # 操作日志表 Schema
│   │   ├── system_role.ts               # 角色表 Schema
│   │   └── system_user.ts               # 用户表 Schema
│   └── sql/                             # 原始 SQL 脚本
│       └── pg.sql                       # PostgreSQL 初始化脚本
│
├── docs/                                # 项目文档目录
│   ├── project-structure.md             # 项目目录结构说明（本文档）
│   └── transaction.md                   # 事务使用文档
│
├── public/                              # 静态资源目录
│   └── index.html                       # 首页 HTML 文件
│
├── script/                              # 脚本工具目录
│   ├── build.ts                         # 项目构建脚本
│   └── seed.ts                          # 数据库种子数据脚本
│
├── dist/                                # 构建输出目录（JS 版本）
│   ├── ecosystem.config.cjs             # PM2 配置文件
│   ├── index.js                         # 构建后的入口文件
│   └── public/                          # 构建后的静态资源
│       └── index.html
│
├── dist_binary/                         # 二进制构建输出目录
│   └── server.exe                       # 编译后的二进制可执行文件
│
├── node_modules/                        # NPM 依赖包目录
│
└── src/                                 # 源代码目录
    ├── index.ts                         # 应用入口文件
    ├── app.ts                           # 应用初始化文件
    │
    ├── config/                          # 配置管理目录
    │   └── index.ts                     # 统一配置导出（数据库、Redis、环境变量等）
    │
    ├── constants/                       # 常量定义目录
    │   ├── dict.ts                      # 字典常量定义
    │   └── enum.ts                      # 枚举类型定义
    │
    ├── core/                            # 核心功能层
    │   ├── cache.ts                     # 缓存管理（基于 Redis）
    │   ├── check.ts                     # 数据校验工具
    │   ├── function.ts                  # 通用业务函数
    │   ├── result.ts                    # 统一响应结果封装
    │   ├── route.ts                     # 路由管理和注册
    │   └── database/                    # 数据库操作层
    │       ├── pg.ts                    # PostgreSQL 客户端实例（Drizzle）
    │       ├── redis.ts                 # Redis 客户端实例
    │       ├── repository.ts            # 数据访问层（Repository 模式，封装通用 CRUD 操作）
    │       └── transaction.ts           # 数据库事务管理
    │
    ├── guards/                          # 守卫层（请求拦截和验证）
    │   ├── api.ts                       # API 接口守卫
    │   ├── auth.ts                      # 认证守卫（JWT 验证）
    │   ├── ipblack.ts                   # IP 黑名单守卫
    │   └── permission.ts                # 权限守卫（角色权限验证）
    │
    ├── infrastructure/                  # 基础设施层
    │   └── clients/                     # 外部服务客户端
    │       └── smtp.ts                  # SMTP 邮件服务客户端
    │
    ├── middleware/                      # 中间件目录
    │   ├── index.ts                     # 中间件统一导出
    │   └── analysis.ts                  # 请求分析中间件（日志记录、统计）
    │
    ├── modules/                         # 业务模块目录
    │   ├── index.ts                     # 模块统一导出
    │   ├── auth/                        # 认证模块
    │   ├── system-api/                  # API 管理模块
    │   ├── system-dept/                 # 部门管理模块
    │   ├── system-dict/                 # 字典管理模块
    │   ├── system-ip-black/             # IP 黑名单管理模块
    │   ├── system-login-log/            # 登录日志模块
    │   ├── system-menu/                 # 菜单管理模块
    │   ├── system-oper-log/             # 操作日志模块
    │   ├── system-role/                 # 角色管理模块
    │   └── system-user/                 # 用户管理模块
    │
    ├── shared/                          # 共享工具函数目录
    │   ├── bcrypt.ts                    # 密码加密工具（基于 bcrypt）
    │   ├── htmltemplate.ts              # HTML 模板工具
    │   ├── ip.ts                        # IP 地址处理工具
    │   ├── jwt.ts                       # JWT 令牌生成和验证工具
    │   ├── rescode.ts                   # 响应状态码定义
    │   ├── time.ts                      # 时间处理工具（基于 dayjs）
    │   └── uuid.ts                      # UUID 生成工具
    │
    └── types/                           # TypeScript 类型定义目录
        ├── index.ts                     # 类型统一导出
        ├── common.ts                    # 通用业务类型（客户端类型、请求方法、账号类型等）
        └── dto.ts                       # DTO 类型定义
```

---

## 技术栈

- **运行时**: Bun
- **框架**: Elysia
- **数据库**: PostgreSQL 17+
- **ORM**: Drizzle ORM
- **缓存**: Redis 5+
- **语言**: TypeScript

---

## 架构说明

### 分层架构
- **Presentation Layer** (表现层): `src/modules/` - 路由和控制器
- **Business Layer** (业务层): `src/modules/*/handle.ts` - 业务逻辑处理
- **Data Access Layer** (数据访问层): `src/core/database/repository.ts` - 数据库操作封装
- **Database Layer** (数据库层): PostgreSQL + Redis

### 设计模式
- **Repository 模式**: 封装数据访问逻辑
- **DTO 模式**: 数据传输对象
- **Guard 模式**: 请求拦截和验证
- **Middleware 模式**: 请求预处理

---

**最后更新**: 2026-02-05
