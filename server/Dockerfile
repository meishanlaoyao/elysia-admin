# 使用官方的Bun容器镜像作为基础镜像
FROM oven/bun AS build

# 在容器内设置工作目录
WORKDIR /app

# 复制项目文件
COPY package.json package.json
COPY bun.lock bun.lock
COPY drizzle.config.ts drizzle.config.ts
COPY tsconfig.json tsconfig.json

# 安装依赖
RUN bun install

# 复制项目代码
COPY ./src ./src

# 设置环境变量为生产环境
ENV NODE_ENV=production

# 构建应用
RUN bun build --compile --minify-whitespace --minify-syntax --target bun --outfile ./server ./src/index.ts

# 使用Google的Distroless基础镜像
FROM gcr.io/distroless/base

# 设置工作目录
WORKDIR /app

# 复制构建好的应用
COPY --from=build /app/server server

# 设置环境变量为生产环境
ENV NODE_ENV=production 

# 定义容器启动时执行的命令
CMD ["./server"]

# 暴露应用端口
EXPOSE 3000