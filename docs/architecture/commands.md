# 内置命令

这里将详细说明项目中内置的各种命令及其使用方法，可以帮助团队成员快速了解和使用这些命令。

## 基本命令

### dev
在开发环境下启动后端服务（仅主进程）。

**使用方式：**
```bash
bun dev
```

### dev:workers
构建 Processor 文件后启动 Worker 进程（定时任务、队列消费）。

**使用方式：**
```bash
bun dev:workers
```

### dev:all
同时启动主进程和 Worker 进程，两个进程的日志合并输出，`[server]` 和 `[workers]` 前缀区分，Ctrl+C 同时关闭。

**使用方式：**
```bash
bun dev:all
```

**指定运行环境：**
```bash
# Windows
$env:NODE_ENV="development"; bun dev:all

# Linux / macOS
NODE_ENV="development" bun dev:all
```

### build
构建后端服务，生成生产环境代码。同时会构建 Worker 进程和所有 Processor 文件。

**使用方式：**
```bash
bun build
```

**推荐使用方式（设置生产环境变量）：**
```bash
# Windows
$env:NODE_ENV="production"; bun run build

# Linux / macOS
NODE_ENV="production" bun run build
```

**构建产物：**
```
dist/
├── index.js              # 主进程
├── workers.js            # Worker 进程
├── cjs/                  # BullMQ 沙箱 bootstrap（自动复制）
├── processors/           # 各队列 Processor
│   ├── system-cron.js
│   ├── flow-buffer.js
│   └── trade-order.js
└── production.yaml       # 配置文件
```

### build:processors
单独构建所有 Processor 文件，开发时修改 `processor.ts` 后执行。

**使用方式：**
```bash
bun build:processors
```

### build:binary
将后端服务构建为二进制可执行文件，适用于无需依赖运行时的部署场景。

> 注意：二进制模式不包含 Worker 进程，队列功能需单独部署。

**使用方式：**
```bash
bun build:binary
```

**推荐使用方式（设置生产环境变量）：**
```bash
# Windows
$env:NODE_ENV="production"; bun run build:binary

# Linux / macOS
NODE_ENV="production" bun run build:binary
```

## 数据库命令

以下命令用于数据库配置管理，**仅建议在开发环境下使用**。

### db:push
将本地数据库配置推送到数据库服务，自动创建或更新数据库结构。

**使用方式：**
```bash
bun db:push
```

### db:pull
从数据库服务拉取配置到本地，同步数据库结构变更。

**使用方式：**
```bash
bun db:pull
```

## Docker 命令

### docker:build
构建项目的 Docker 镜像，用于容器化部署。

**使用方式：**
```bash
bun docker:build
```

### docker:run
在 Docker 容器中启动后端服务。

**使用方式：**
```bash
bun docker:run
```

### docker:stop
停止 Docker 容器中运行的后端服务。

**使用方式：**
```bash
bun docker:stop
```

### docker:rm
删除 Docker 中运行的后端服务容器。

**使用方式：**
```bash
bun docker:rm
```

### docker:logs
查看 Docker 容器中运行的后端服务日志。

**使用方式：**
```bash
bun docker:logs
```