# 常见问题

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

