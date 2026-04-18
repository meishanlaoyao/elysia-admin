---
title: 常见问题 - Elysia Admin
description: 解答 Elysia Admin 使用过程中的常见问题，包括 PM2 集群模式限制、多实例部署方案及 Nginx 负载均衡配置。
head:
  - - meta
    - name: keywords
      content: Elysia Admin 常见问题, FAQ, PM2集群, 多实例部署, Nginx负载均衡, Bun
  - - meta
    - property: og:title
      content: 常见问题 - Elysia Admin
  - - meta
    - property: og:description
      content: 解答 Elysia Admin 常见疑问，包括 PM2 集群限制与多实例部署方案。
---

# 常见问题

## 为什么不再支持二进制打包？

从引入 BullMQ Sandboxed Processors 之后，二进制打包就不再可行了。

原因有两个：第一，`config/index.ts` 通过 `readFileSync` 读取 `production.yaml`，二进制文件没有文件系统，读不到外部文件。第二，也是更根本的问题，Sandboxed 模式下 BullMQ 会用 `child_process.spawn` 启动独立子进程来执行每个任务，而二进制包里没有 `bun` 运行时，也没有 `processors/` 目录，子进程根本无法启动。

如果放弃 Sandboxed 模式改回函数模式，二进制是可以打包的，但会失去进程隔离的优势。综合考虑，直接使用 PM2 部署是更合适的方案，稳定性和功能都更完整。

## 为什么无法使用PM2的cluster(集群模式)？
`PM2` 的集群模式并不是自己发明了多进程管理，而是深度依赖 `Node.js` 原生的 `cluster` 模块。当你设置 `exec_mode: 'cluster'` 时，`PM2` 实际上是在调用 `Node.js` 的内部 API 来分叉进程并共享端口（TCP 句柄）。

但是我们的 `Elysia Admin` 项目完全依赖 `Bun` 。 `Bun` 虽然兼容了很多 `Node.js` API，但它并没有完全实现 cluster 模块（或者说实现方式与 Node 不同）。

因此你需要手动多实例：
```js
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'Elysia-Admin-1',
      script: 'bun',
      args: 'run index.js',
      interpreter: 'node',
      exec_mode: 'fork', // 必须 fork
      env: {
        PORT: 3001, // 指定不同端口
        NODE_ENV: 'production'
      }
    },
    {
      name: 'Elysia-Admin-2',
      script: 'bun',
      args: 'run index.js',
      interpreter: 'node',
      exec_mode: 'fork',
      env: {
        PORT: 3002, // 指定不同端口
        NODE_ENV: 'production'
      }
    },
    // 可以继续加 3, 4...
  ]
};
```
```txt
# nginx
http {
    upstream elysia_app {
        server 127.0.0.1:3001;
        server 127.0.0.1:3002;
        # 负载均衡策略，默认是轮询
    }

    server {
        listen 80;
        location / {
            proxy_pass http://elysia_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```