# 项目结构
这里将详细说明 `Elysia Admin` 的整体结构，包括前端和后端的目录组织、文件功能及模块划分，能够帮助开发人员快速了解项目架构。

## 整体结构

```
elysia-admin
├── .ai                         # AI 项目理解目录
├── admin                       # 后台管理系统目录
├── docs                        # 文档目录
└── server                      # 后端服务目录
```

## 前端结构

前端采用 `Vue 3` 框架构建，遵循模块化、组件化的设计原则。

```
├── src
│   ├── api                     # API 接口相关代码
│   │   ├── auth.ts             # 认证相关 API 接口定义（登录、注册、用户信息等）
│   │   └── system-manage.ts    # 系统管理相关 API 接口定义（菜单、用户、角色管理等）
│   ├── App.vue                 # Vue 根组件，定义应用全局结构和入口
│   ├── assets                  # 静态资源目录
│   │   ├── images              # 图片资源目录
│   │   ├── styles              # 全局样式文件
│   │   │   ├── core            # 核心样式（系统级样式）
│   │   │   ├── custom          # 自定义样式（业务级样式）
│   │   │   └── index.scss      # 样式入口文件
│   │   └── svg                 # SVG 相关资源
│   │       └── loading.ts      # 加载动画 SVG 定义
│   ├── components              # 组件目录
│   │   ├── business            # 业务组件（业务相关自定义组件）
│   │   │   └── comment-widget  # 评论组件
│   │   └── core                # 核心组件（系统级通用组件库）
│   │       ├── banners         # 横幅组件
│   │       ├── base            # 基础组件
│   │       ├── cards           # 卡片组件
│   │       ├── charts          # 图表组件
│   │       ├── forms           # 表单组件
│   │       ├── layouts         # 布局组件
│   │       ├── media           # 媒体组件
│   │       ├── others          # 其他组件
│   │       ├── tables          # 表格组件
│   │       ├── text-effect     # 文本特效组件
│   │       ├── theme           # 主题相关组件
│   │       ├── views           # 视图组件
│   │       └── widget          # 小部件组件
│   ├── config                  # 项目配置目录
│   │   ├── assets              # 静态资源配置
│   │   │   └── images.ts       # 图片资源路径配置
│   │   ├── modules             # 模块化配置
│   │   │   ├── component.ts    # 组件配置
│   │   │   ├── fastEnter.ts    # 快捷入口配置
│   │   │   ├── festival.ts     # 节日/活动配置
│   │   │   └── headerBar.ts    # 顶部栏配置
│   │   ├── index.ts            # 配置入口文件
│   │   └── setting.ts          # 系统设置配置
│   ├── directives              # Vue 自定义指令
│   │   ├── business            # 业务指令
│   │   │   ├── highlight.ts    # 高亮指令
│   │   │   └── ripple.ts       # 波纹效果指令
│   │   ├── core                # 核心指令
│   │   │   ├── auth.ts         # 认证指令
│   │   │   └── roles.ts        # 角色权限指令
│   │   └── index.ts            # 指令入口文件
│   ├── enums                   # 枚举定义
│   │   ├── appEnum.ts          # 应用级枚举（主题类型、语言类型等）
│   │   └── formEnum.ts         # 表单相关枚举（表单状态、验证规则等）
│   ├── env.d.ts                # TypeScript 环境声明文件
│   ├── hooks                   # Vue 3 Composable 函数（可复用逻辑）
│   │   ├── core                # 核心 Hooks
│   │   │   ├── useAppMode.ts   # 应用模式相关逻辑
│   │   │   ├── useAuth.ts      # 认证相关逻辑
│   │   │   ├── useCeremony.ts  # 节日/仪式相关逻辑
│   │   │   ├── useChart.ts     # 图表相关逻辑
│   │   │   ├── useCommon.ts    # 通用逻辑
│   │   │   ├── useFastEnter.ts # 快捷入口逻辑
│   │   │   ├── useHeaderBar.ts # 顶部栏逻辑
│   │   │   ├── useLayoutHeight.ts # 布局高度计算逻辑
│   │   │   ├── useTable.ts     # 表格逻辑
│   │   │   ├── useTableColumns.ts # 表格列配置逻辑
│   │   │   ├── useTableHeight.ts # 表格高度计算逻辑
│   │   │   └── useTheme.ts     # 主题切换逻辑
│   │   └── index.ts            # Hooks 入口文件
│   ├── locales                 # 国际化（i18n）资源
│   │   ├── index.ts            # 国际化入口文件
│   │   └── langs               # 多语言文件
│   │       ├── en.json         # 英文语言包
│   │       └── zh.json         # 中文语言包
│   ├── main.ts                 # 项目主入口文件
│   ├── mock                    # Mock 数据目录
│   │   ├── json                # JSON 格式 Mock 数据
│   │   │   └── chinaMap.json   # 中国地图数据
│   │   ├── temp                # 临时 Mock 数据
│   │   │   ├── articleList.ts  # 文章列表数据
│   │   │   ├── commentDetail.ts # 评论详情数据
│   │   │   ├── commentList.ts  # 评论列表数据
│   │   │   └── formData.ts     # 表单数据
│   │   └── upgrade             # 更新日志数据
│   │       └── changeLog.ts    # 变更日志数据
│   ├── plugins                 # 插件配置
│   │   ├── echarts.ts          # ECharts 图表库配置
│   │   └── index.ts            # 插件入口文件
│   ├── router                  # Vue Router 路由相关代码
│   │   ├── core                # 路由核心功能
│   │   │   ├── ComponentLoader.ts # 组件加载器
│   │   │   ├── IframeRouteManager.ts # Iframe 路由管理器
│   │   │   ├── MenuProcessor.ts # 菜单处理器
│   │   │   ├── RouteRegistry.ts # 路由注册器
│   │   │   ├── RouteTransformer.ts # 路由转换器
│   │   │   ├── RouteValidator.ts # 路由验证器
│   │   │   └── index.ts        # 核心功能入口
│   │   ├── guards              # 路由守卫
│   │   │   ├── afterEach.ts    # 全局后置守卫
│   │   │   └── beforeEach.ts   # 全局前置守卫
│   │   ├── modules             # 路由模块定义
│   │   │   ├── article.ts      # 文章模块路由
│   │   │   ├── dashboard.ts    # 仪表盘路由
│   │   │   ├── examples.ts     # 示例页面路由
│   │   │   ├── exception.ts    # 异常页面路由
│   │   │   ├── help.ts         # 帮助页面路由
│   │   │   ├── index.ts        # 路由模块入口
│   │   │   ├── result.ts       # 结果页面路由
│   │   │   ├── safeguard.ts    # 安全防护路由
│   │   │   ├── system.ts       # 系统管理路由
│   │   │   ├── template.ts     # 模板页面路由
│   │   │   └── widgets.ts      # 小组件路由
│   │   ├── routes              # 路由配置
│   │   │   ├── asyncRoutes.ts  # 异步路由（动态路由）
│   │   │   └── staticRoutes.ts # 静态路由（固定路由）
│   │   ├── index.ts            # 路由主入口
│   │   └── routesAlias.ts      # 路由别名定义
│   ├── store                   # Pinia 状态管理
│   │   ├── modules             # 状态管理模块
│   │   │   ├── menu.ts         # 菜单状态管理
│   │   │   ├── setting.ts      # 设置状态管理
│   │   │   ├── table.ts        # 表格状态管理
│   │   │   ├── user.ts         # 用户状态管理
│   │   │   └── worktab.ts      # 工作标签页状态管理
│   │   └── index.ts            # Pinia 入口文件
│   ├── types                   # TypeScript 类型定义
│   │   ├── api                 # API 相关类型
│   │   │   └── api.d.ts        # API 接口类型定义
│   │   ├── common              # 通用类型定义
│   │   │   ├── index.ts        # 通用类型入口
│   │   │   └── response.ts     # 响应类型定义
│   │   ├── component           # 组件相关类型
│   │   │   ├── chart.ts        # 图表组件类型
│   │   │   └── index.ts        # 组件类型入口
│   │   ├── config              # 配置相关类型
│   │   │   └── index.ts        # 配置类型定义
│   │   ├── import              # 自动导入类型声明
│   │   │   ├── auto-imports.d.ts # 自动导入的函数类型
│   │   │   └── components.d.ts # 自动导入的组件类型
│   │   ├── router              # 路由相关类型
│   │   │   └── index.ts        # 路由类型定义
│   │   ├── store               # 状态管理相关类型
│   │   │   └── index.ts        # Store 类型定义
│   │   └── index.ts            # 类型定义总入口
│   ├── utils                   # 工具函数目录
│   │   ├── constants           # 常量定义
│   │   │   ├── index.ts        # 常量入口
│   │   │   └── links.ts        # 链接常量
│   │   ├── form                # 表单相关工具
│   │   │   ├── index.ts        # 表单工具入口
│   │   │   ├── responsive.ts   # 响应式表单工具
│   │   │   └── validator.ts    # 表单验证工具
│   │   ├── http                # HTTP 请求工具
│   │   │   ├── error.ts        # 错误处理
│   │   │   ├── index.ts        # HTTP 工具入口
│   │   │   └── status.ts       # 状态码处理
│   │   ├── navigation          # 导航相关工具
│   │   │   ├── index.ts        # 导航工具入口
│   │   │   ├── jump.ts         # 页面跳转工具
│   │   │   ├── route.ts        # 路由工具
│   │   │   └── worktab.ts      # 工作标签页工具
│   │   ├── storage             # 存储相关工具
│   │   │   ├── index.ts        # 存储工具入口
│   │   │   ├── storage-config.ts # 存储配置
│   │   │   ├── storage-key-manager.ts # 存储键管理
│   │   │   └── storage.ts      # 存储工具实现
│   │   ├── sys                 # 系统相关工具
│   │   │   ├── console.ts      # 控制台工具
│   │   │   ├── error-handle.ts # 错误处理
│   │   │   ├── index.ts        # 系统工具入口
│   │   │   ├── mittBus.ts      # 事件总线
│   │   │   └── upgrade.ts      # 升级相关工具
│   │   ├── table               # 表格相关工具
│   │   │   ├── tableCache.ts   # 表格缓存
│   │   │   ├── tableConfig.ts  # 表格配置
│   │   │   └── tableUtils.ts   # 表格工具函数
│   │   ├── ui                  # UI 相关工具
│   │   │   ├── animation.ts    # 动画工具
│   │   │   ├── colors.ts       # 颜色工具
│   │   │   ├── emojo.ts        # 表情工具
│   │   │   ├── index.ts        # UI 工具入口
│   │   │   ├── loading.ts      # 加载动画工具
│   │   │   └── tabs.ts         # 标签页工具
│   │   ├── index.ts            # 工具函数总入口
│   │   └── router.ts           # 路由工具函数
│   └── views                   # 页面组件目录
├── tsconfig.json               # TypeScript 配置文件
├── .env                        # 环境变量配置文件
├── .env.development            # 开发环境变量配置文件
├── .env.production             # 生产环境变量配置文件
├── .gitattributes              # Git 属性文件
├── .gitignore                  # Git 忽略文件
├── .prettierignore             # Prettier 忽略文件
├── .prettierrc                 # Prettier 配置文件
├── .stylelintignore            # Stylelint 忽略文件
├── .stylelintrc                # Stylelint 配置文件
├── commitlint.config.cjs       # Commitlint 配置文件
├── eslint.config.mjs           # ESLint 配置文件
├── index.html                  # HTML 入口文件
├── package.json                # 项目依赖配置文件
├── pnpm-lock.yaml              # pnpm 锁定文件
└── vite.config.ts              # Vite 配置文件
```

## 后端结构

后端采用 `Elysia.js` 框架构建，遵循分层架构设计。

```
├── database                      # 数据库定义层目录
│   ├── schema                    # 业务表 Schema 定义
│   ├── sql                       # 原始 SQL 脚本
│   │   └── pg.sql                # PostgreSQL 初始化脚本
│   └── base-schema.ts            # 基础字段定义
├── public                        # 静态资源目录
├── script                        # 脚本工具目录
│   ├── build-processors.ts       # 构建 worker 脚本
│   ├── build.ts                  # 构建脚本
│   ├── generate-dbconfig.ts      # 数据库拉取推送脚本
│   ├── generate-registry.ts      # 生成注册表脚本
│   └── seed.ts                   # 数据库种子脚本
├── src                           # 源代码目录
│   ├── config                    # 配置文件目录
│   │   ├── development.yaml      # 开发环境配置文件
│   │   ├── production.yaml       # 生产环境配置文件
│   │   └── index.ts              # 配置文件总入口
│   ├── constants                 # 常量定义目录
│   │   ├── base.ts               # 基础常量
│   │   ├── dict.ts               # 字典常量
│   │   └── enum.ts               # 枚举常量
│   ├── core                      # 核心功能层
│   │   ├── database              # 数据库操作层
│   │   │   ├── pg.ts             # PostgreSQL 客户端实例（Drizzle）
│   │   │   ├── redis-lock.ts     # Redis 锁实例
│   │   │   ├── redis.ts          # Redis 客户端实例
│   │   │   ├── repository.ts     # 数据访问层（Repository 模式，封装通用 CRUD 操作）
│   │   │   └── transaction.ts    # 数据库事务管理
│   │   ├── cache.ts              # 缓存管理层
│   │   ├── check.ts              # 常用校验函数
│   │   ├── function.ts           # 通用函数层
│   │   ├── result.ts             # 结果处理层
│   │   ├── route-registry.ts     # 路由注册层
│   │   └── task-registry.ts      # 任务注册层
│   ├── infrastructure            # 基础设施层
│   │   ├── clients               # 客户端层
│   │   │   └── smtp.ts           # SMTP 客户端实例
│   │   ├── queue                 # 队列
│   │   │   ├── config
│   │   │   ├── core
│   │   │   ├── queues
│   │   │   ├── runtime
│   │   │   └── index.ts
│   │   └── storage               # 存储层
│   │       ├── providers         # 存储提供层
│   │       │   ├── cos.ts        # COS 存储提供层
│   │       │   ├── kodo.ts       # Kodo 存储提供层
│   │       │   ├── oss.ts        # OSS 存储提供层
│   │       │   └── rustfs.ts     # RustFS 存储提供层
│   │       ├── index.ts          # 存储提供层总入口
│   │       └── types.ts          # 存储提供层类型定义文件
│   ├── middleware                # 中间件层
│   │   ├── guards                    # 守卫层
│   │   │   ├── api.ts                # API 开关
│   │   │   ├── auth.ts               # 认证守卫
│   │   │   ├── ipblack.ts            # IP 黑名单守卫
│   │   │   ├── ipratelimit.ts        # IP 限流守卫
│   │   │   └── permission.ts         # 权限守卫
│   │   ├── analysis.ts           # 分析中间件
│   │   └── index.ts              # 中间件层总入口
│   ├── modules                   # 模块层
│   │   ├── ***                   # 模块层目录
│   │   │   ├── dto.ts            # 校验层定义
│   │   │   ├── handle.ts         # 处理层定义
│   │   │   ├── route.ts          # 路由层定义
│   │   │   └── task.ts           # 任务层定义
│   ├── shared                    # 共享工具函数目录
│   │   ├── bcrypt.ts             # 加密工具函数
│   │   ├── color.ts              # 颜色工具函数
│   │   ├── cron.ts               # 定时任务工具函数
│   │   ├── htmltemplate.ts       # HTML 模板工具函数
│   │   ├── ip.ts                 # IP 工具函数
│   │   ├── jwt.ts                # JWT 工具函数
│   │   ├── logger.ts             # 日志工具函数
│   │   ├── rescode.ts            # 结果码工具函数
│   │   ├── time.ts               # 时间工具函数
│   │   └── uuid.ts               # UUID 工具函数
│   ├── types                     # 类型定义目录
│   │   ├── common.ts             # 公共类型定义文件
│   │   ├── dto.ts                # 校验层类型定义文件
│   │   ├── index.ts              # 类型定义总入口
│   │   ├── route.ts              # 路由层类型定义文件
│   │   └── task.ts               # 任务层类型定义文件
│   ├── app.ts                    # 应用层入口文件
│   └── index.ts                  # 应用层总入口文件
├── .gitignore                    # Git 忽略文件
├── bun.lock                      # Bun 依赖锁定文件
├── Dockerfile                    # Docker 镜像构建配置
├── drizzle.config.ts             # Drizzle ORM 配置文件（自动生成）
├── package.json                  # 项目依赖配置文件
├── README.md                     # 项目说明文档
└── tsconfig.json                 # TypeScript 配置文件
```