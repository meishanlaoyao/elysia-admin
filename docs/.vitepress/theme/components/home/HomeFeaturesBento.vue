<script setup lang="ts">
import { ref } from 'vue'
import { useEaScrollReveal } from '../../composables/useEaScrollReveal'
import {
  LayoutTemplate,
  RefreshCw,
  Database,
  GitBranch,
  Zap,
  Shield,
  Server,
  Timer,
  FileJson,
} from 'lucide-vue-next'

/** 与《介绍》主要特征、技术选型对齐；固定 3 列等宽卡片 */
const cards = [
  {
    icon: LayoutTemplate,
    title: 'Art Design Pro 管理端',
    desc: '前端基于 Art Design Pro，响应式界面与高级组件开箱即用。',
  },
  {
    icon: RefreshCw,
    title: '接口与任务自动注册',
    desc: '后端模块与定时任务自动扫描加载，减少手动 import 与配置。',
  },
  {
    icon: Database,
    title: 'Drizzle + 端到端 TS',
    desc: '从数据库到 API 的类型推导，减少 any，与 DrizzleORM 深度集成。',
  },
  {
    icon: GitBranch,
    title: '配置式路由',
    desc: '类似 Vue Router 的声明式路由，路径、方法、权限与处理器解耦。',
  },
  {
    icon: Zap,
    title: 'Bun + Elysia 运行时',
    desc: 'server 侧 Bun 运行 ElysiaJS，追求启动速度与请求延迟表现。',
  },
  {
    icon: Shield,
    title: 'RBAC · JWT · 动态路由',
    desc: '内置权限、认证与后台菜单路由能力，贴合常见企业后台需求。',
  },
  {
    icon: Server,
    title: 'PostgreSQL · Redis',
    desc: '持久化与会话、缓存、队列共用 Redis，与官方文档环境依赖一致。',
  },
  {
    icon: Timer,
    title: '队列 · 缓存 · 定时任务',
    desc: '异步任务、缓存抽象与 Cron 指南齐全，可与多实例部署配合。',
  },
  {
    icon: FileJson,
    title: 'OpenAPI · 存储 · 支付',
    desc: '内置 OpenAPI 文档与 JSON；另有存储、支付等集成指南可按需启用。',
  },
]

const sectionEl = ref<HTMLElement | null>(null)
useEaScrollReveal(sectionEl, {
  trigger: 'head',
  start: 'top 72%',
})
</script>

<template>
  <section ref="sectionEl" class="border-b border-ea py-20 md:py-28">
    <div class="mx-auto max-w-content px-5 md:px-8">
      <div class="mx-auto max-w-2xl text-center md:max-w-3xl">
        <h2 class="ea-scroll-head text-3xl font-bold tracking-tight text-fg md:text-4xl">
          框架能力
        </h2>
        <p class="ea-scroll-head mt-4 text-base leading-[1.65] text-fg-muted md:text-lg md:leading-[1.7]">
          对应文档《介绍》中的定位：单仓 <strong class="text-fg">admin · server · docs</strong>，
          典型路径是浏览器访问管理端，经 HTTP 调用 API，由 server 访问 PostgreSQL 与 Redis。
        </p>
        <div class="mt-4 flex justify-center">
          <a class="text-brand hover:underline" href="/start/introduction">阅读完整介绍</a>
        </div>
      </div>

      <div class="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="c in cards"
          :key="c.title"
          class="ea-scroll-item group relative flex min-h-[148px] flex-col overflow-hidden rounded-2xl border border-ea bg-ea-surface-card p-5 transition duration-500 ease-expo-out hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-[0_0_48px_-12px_rgba(128,82,228,0.35)]"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style="
              background: radial-gradient(
                420px circle at 50% 0%,
                rgba(128, 82, 228, 0.14),
                transparent 55%
              );
            "
          />
          <component
            :is="c.icon"
            class="relative z-10 mb-3 h-8 w-8 shrink-0 text-brand"
            stroke-width="1.5"
          />
          <h3 class="relative z-10 text-base font-semibold leading-snug text-fg">
            {{ c.title }}
          </h3>
          <p class="relative z-10 mt-2 flex-1 text-[13px] leading-relaxed text-fg-muted">
            {{ c.desc }}
          </p>
        </article>
      </div>

      <div class="ea-scroll-block mt-10 flex justify-center">
        <img
          src="/home/1-dark.webp"
          alt="架构图"
          class="w-full max-w-[1100px]"
        >
      </div>
    </div>
  </section>
</template>
