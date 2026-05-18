<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEaScrollReveal } from '../../composables/useEaScrollReveal'
import { useEaTheme } from '../../composables/useEaTheme'

const stats = [
  {
    label: '典型内存',
    value: '~80MB',
    hint: '《介绍》中「资源受限环境」场景下的参考占用，随业务与实例数变化。',
  },
  {
    label: '运行时',
    value: 'Bun + Elysia',
    hint: 'server 使用 Bun 启动 Elysia；开发时另起 admin 侧 Vite 开发服务器。',
  },
  {
    label: '类型与数据',
    value: 'TS + Drizzle',
    hint: '从数据库到 API 的类型推导；PostgreSQL 持久化、Redis 会话与缓存。',
  },
]

const section = ref<HTMLElement | null>(null)
const { isDark } = useEaTheme()
const performanceImgSrc = computed(() =>
  isDark.value ? '/home/2-dark.webp' : '/home/2.webp',
)
useEaScrollReveal(section)
</script>

<template>
  <section ref="section" class="border-b border-ea py-20 md:py-28">
    <div class="mx-auto max-w-content px-5 md:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="ea-scroll-head text-3xl font-bold tracking-tight text-fg md:text-4xl">
          性能与部署画像
        </h2>
        <p class="ea-scroll-head mx-auto mt-3 max-w-2xl leading-[1.65] text-fg-muted md:leading-[1.7]">
          文档强调「轻量、可横向扩展」：多实例时通过 Redis 同步会话与状态，队列 Worker 与 HTTP 服务协作方式见
          <a class="text-brand hover:underline" href="/guide/queue">队列指南</a>。
        </p>
      </div>

      <div class="mt-12 grid gap-4 md:grid-cols-3">
        <div
          v-for="s in stats"
          :key="s.label"
          class="ea-scroll-item rounded-2xl border border-ea bg-gradient-to-b from-ea-card-gradient to-transparent p-6"
        >
          <p class="text-[13px] font-medium uppercase tracking-wider text-fg-subtle">
            {{ s.label }}
          </p>
          <p class="mt-3 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
            {{ s.value }}
          </p>
          <p class="mt-2 text-sm leading-relaxed text-fg-subtle">
            {{ s.hint }}
          </p>
        </div>
      </div>

      <div class="ea-scroll-block mt-10">
        <img :src="performanceImgSrc" alt="监控或压测曲线图" class="w-full" >
      </div>
    </div>
  </section>
</template>
