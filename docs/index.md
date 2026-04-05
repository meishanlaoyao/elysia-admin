---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Elysia Admin"
  text: "优雅开发，极致性能"
  tagline: "极致性能，开箱即用。融合 Bun 的极速与 Vue 的灵活，打造下一代企业级管理后台。"
  image:
    src: "/logo.svg"
    alt: "Elysia Admin Logo"
  actions:
    - theme: brand
      text: "快速开始"
      link: /start/quick-start
    - theme: alt
      text: "常见问题"
      link: /other/faq
    - theme: alt
      text: "在线演示"
      link: 'http://elysia-admin.top/admin'

features:
  - icon: "⚡️"
    title: "极致性能"
    details: "基于 Bun 运行时与 ElysiaJS，实现毫秒级启动与超低延迟。拒绝臃肿，享受飞一般的后端响应速度。"
  - icon: "🧩"
    title: "现代技术栈"
    details: "后端 Bun + ElysiaJS + DrizzleORM，前端 Vue 3 + TypeScript + Vite。融合 Bun 的极速与 Vue 3 的灵活，打造高效全栈开发体验。"
  - icon: "📐"
    title: "优雅架构设计"
    details: "摒弃 ElysiaJS 传统链式调用，采用模块化路由配置。将接口路径、方法、处理器等集中管理，代码结构一目了然，大幅提升可维护性。"
  - icon: "📦"
    title: "开箱即用"
    details: "内置 RBAC 权限、动态路由、JWT 认证等企业级功能。预设标准后台业务逻辑，无需从零开发，克隆项目即可直接开始业务开发。"
  - icon: "🐳"
    title: "灵活部署"
    details: "支持 PM2 进程守护与 Docker 容器化部署，提供标准化部署脚本。无论是单机运行还是集群管理，都能快速适配，让运维变得简单高效。"
  - icon: "🔗"
    title: "多实例支持"
    details: "后端设计支持多实例横向扩展，配合 Redis 实现会话共享与状态同步。轻松应对流量洪峰，确保高可用架构下的系统稳定性。"
---