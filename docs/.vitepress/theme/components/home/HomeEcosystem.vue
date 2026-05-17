<script setup lang="ts">
import { ref } from 'vue'
import HomeTechLogos from './HomeTechLogos.vue'
import { useEaScrollReveal } from '../../composables/useEaScrollReveal'

/** 与《介绍》技术选型、环境依赖一致 */
const stack = [
  {
    name: 'Vue 3 + Vite',
    sub: 'admin 管理端',
    logos: ['/logos/vue.svg', '/logos/vite.svg'],
  },
  {
    name: 'Pinia + Vue Router',
    sub: '状态与路由',
    logos: ['/logos/pinia.svg'],
  },
  {
    name: 'Element Plus',
    sub: 'UI 与 Tailwind 辅助',
    logos: ['/logos/element.svg'],
  },
  {
    name: 'Elysia on Bun',
    sub: 'server API',
    logos: ['/logos/elysia.svg', '/logos/bun.svg'],
  },
  {
    name: 'Drizzle ORM',
    sub: '类型安全 SQL',
    logos: ['/logos/drizzle-orm.svg'],
  },
  {
    name: 'PostgreSQL',
    sub: '≥ 16',
    logos: ['/logos/postgresql.svg'],
  },
  {
    name: 'Redis',
    sub: '≥ 6 · 会话/缓存/队列',
    logos: ['/logos/redis.svg'],
  },
  {
    name: 'Docker / PM2',
    sub: '可选部署方式',
    logos: ['/logos/docker.svg', '/logos/pm2.svg'],
  },
]

const section = ref<HTMLElement | null>(null)
useEaScrollReveal(section)
</script>

<template>
  <section ref="section" class="border-b border-ea py-20 md:py-28">
    <div class="mx-auto max-w-content px-5 md:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="ea-scroll-head text-3xl font-bold tracking-tight text-fg md:text-4xl">
          技术栈与依赖
        </h2>
        <p class="ea-scroll-head mx-auto mt-3 max-w-2xl leading-[1.65] text-fg-muted md:leading-[1.7]">
          与文档《介绍》中单仓目录、运行时与数据层描述一致；可选工具链（Docker、PM2、RustFS 等）详见该页「环境依赖」小节。
        </p>
      </div>

      <div class="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        <article
          v-for="item in stack"
          :key="item.name"
          class="ea-scroll-item group relative flex min-h-[108px] flex-col overflow-hidden rounded-2xl border border-ea bg-ea-surface-card px-4 py-4 transition duration-500 ease-expo-out hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-[0_0_48px_-12px_rgba(128,82,228,0.35)]"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style="
              background: radial-gradient(
                320px circle at 50% 0%,
                rgba(128, 82, 228, 0.14),
                transparent 55%
              );
            "
          />
          <div class="relative z-10 mb-3 flex items-center gap-2">
            <img
              v-for="src in item.logos"
              :key="src"
              :src="src"
              :alt="item.name"
              class="h-6 w-6 object-contain opacity-90"
              loading="lazy"
              decoding="async"
              draggable="false"
            >
          </div>
          <span class="relative z-10 text-[14px] font-semibold leading-snug text-fg">
            {{ item.name }}
          </span>
          <span class="relative z-10 mt-1 text-[12px] leading-snug text-fg-subtle">
            {{ item.sub }}
          </span>
        </article>
      </div>
    </div>

    <div class="mt-16 md:mt-20">
      <p class="ea-scroll-head mb-6 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-fg-faint">
        Powered by
      </p>
      <HomeTechLogos />
    </div>
  </section>
</template>
