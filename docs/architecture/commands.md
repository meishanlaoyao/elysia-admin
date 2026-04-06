# 内置命令

这里将详细说明项目中内置的各种命令及其使用方法，可以帮助团队成员快速了解和使用这些命令。

## 基本命令

### dev
在开发环境下启动后端服务。

**使用方式：**
```bash
bun dev
```

**指定运行环境：**
```bash
# Windows
$env:NODE_ENV="development"; pnpm dev

# Linux / macOS
NODE_ENV="development"; pnpm dev
```

### build
构建后端服务，生成生产环境代码。

**使用方式：**
```bash
bun build
```

**推荐使用方式（设置生产环境变量）：**
```bash
# Windows
$env:NODE_ENV="production"; bun run build

# Linux / macOS
NODE_ENV="production"; bun run build
```

### build:binary
将后端服务构建为二进制可执行文件，适用于无需依赖 Node.js 环境的部署场景。

**使用方式：**
```bash
bun build:binary
```

**推荐使用方式（设置生产环境变量）：**
```bash
# Windows
$env:NODE_ENV="production"; bun run build:binary

# Linux / macOS
NODE_ENV="production"; bun run build:binary
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