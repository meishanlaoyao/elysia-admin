<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { withBase } from 'vitepress'
import { useEaVersion } from '../../composables/useEaVersion'
import { eaPrefersReducedMotion } from '../../composables/useEaScrollReveal'
import { eaExternalLinkAttrs } from '../../shared/linkAttrs'
import { useEaTheme } from '../../composables/useEaTheme'

const { data: version } = useEaVersion()
const { theme } = useEaTheme()
const giteeBadgeTheme = computed(() => (theme.value === 'dark' ? 'dark' : 'light'))

const root = ref<HTMLElement | null>(null)
const glowX = ref(50)
const glowY = ref(40)

function onMove(e: MouseEvent) {
  if (!root.value) return
  const r = root.value.getBoundingClientRect()
  glowX.value = ((e.clientX - r.left) / r.width) * 100
  glowY.value = ((e.clientY - r.top) / r.height) * 100
}

let heroCtx: gsap.Context | null = null

onMounted(() => {
  const el = root.value
  if (!el) return
  el.addEventListener('mousemove', onMove)
  if (eaPrefersReducedMotion()) return
  const targets = el.querySelectorAll('.ea-hero-reveal')
  if (!targets.length) return
  heroCtx = gsap.context(() => {
    gsap.from(targets, {
      opacity: 0,
      y: 28,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'opacity',
    })
  }, el)
})

onUnmounted(() => {
  root.value?.removeEventListener('mousemove', onMove)
  heroCtx?.revert()
})

function changelogHref() {
  const u = version.value?.changelogUrl
  if (u?.startsWith('http')) return u
  return withBase('/start/change-log')
}
</script>

<template>
  <section
    ref="root"
    class="ea-hero relative overflow-hidden border-b border-ea pb-28 pt-12 md:pb-12 md:pt-20"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.65]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-brand/25 blur-[120px]"
      :style="{
        opacity: 0.45,
        transform: `translate(${glowX * 0.15}px, ${glowY * 0.08}px)`,
      }"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -right-1/4 bottom-0 h-[420px] w-[420px] rounded-full bg-brand-muted/30 blur-[100px]"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto max-w-content px-5 md:px-8">
      <div
        class="ea-hero-inner mx-auto flex w-full max-w-3xl flex-col items-center text-center md:max-w-4xl"
      >
        <h1
          class="ea-hero-reveal mt-20 mb-8 w-full text-center text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl md:leading-[1.12] lg:text-6xl lg:leading-[1.12] xl:text-7xl xl:leading-[1.12]"
        >
          <span class="ea-hero-title-shimmer">Elysia Admin</span>
        </h1>
        <p
          class="ea-hero-reveal mt-6 max-w-2xl mx-auto text-[15px] leading-[1.65] text-fg-muted md:mt-8 md:text-[17px] md:leading-[2]"
        >
          <span class="text-fg">Bun + Elysia</span> 与 <span class="text-fg">Vue 3</span> 单仓全栈；后端以
          <span class="text-fg">配置式路由</span>替代链式调用，
          <span class="text-fg">自动注册</span>模块与定时任务，<span class="text-fg">Drizzle + TS</span>，RBAC / 队列等开箱可用。
        </p>
        <div class="ea-hero-reveal flex flex-wrap items-center justify-center gap-3 mt-8">
          <p class="text-[13px] font-medium uppercase tracking-[0.18em] text-fg-subtle">
            ElysiaJS · Bun · Vue 3 · Drizzle
          </p>
          <a
            v-if="version"
            :href="changelogHref()"
            class="inline-flex items-center gap-1.5 rounded-full border border-ea-strong bg-ea-hero-btn-secondary px-2.5 py-1 text-[12px] text-fg-muted transition hover:border-brand/40 hover:text-fg"
            v-bind="eaExternalLinkAttrs(version.changelogUrl?.startsWith('http'))"
          >
            <span class="text-fg-subtle">v</span>
            <span class="font-mono font-medium text-brand">{{ version.version }}</span>
            <span class="text-fg-faint">·</span>
            <span class="text-fg-faint">{{ version.publishDate }}</span>
          </a>
        </div>
        <div
          class="ea-hero-reveal mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-4 sm:gap-y-3 md:mt-12"
        >
          <a
            href="/start/quick-start"
            class="inline-flex w-full items-center justify-center rounded-full bg-ea-hero-btn-primary px-6 py-3 text-sm font-semibold text-ea-hero-btn-primary-fg transition duration-400 ease-out hover:opacity-90 sm:w-auto"
          >
            快速开始
          </a>
          <a
            href="https://demo.elysia-admin.top/admin"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex w-full items-center justify-center rounded-full border border-ea-hero-btn-secondary bg-ea-hero-btn-secondary px-6 py-3 text-sm font-medium text-fg transition duration-400 ease-out hover:border-brand/40 hover:opacity-90 sm:w-auto"
          >
            在线演示
          </a>
          <a
            href="/start/introduction"
            class="inline-flex items-center justify-center rounded-full px-4 py-3 text-sm text-fg-muted transition hover:text-fg"
          >
            项目介绍
          </a>
          <a
            href="/other/faq"
            class="inline-flex items-center justify-center rounded-full px-2 py-3 text-sm text-fg-subtle transition hover:text-fg"
          >
            常见问题
          </a>
        </div>
        <div class="ea-hero-reveal flex w-full flex-col items-center gap-3 mt-8">
          <div class="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/meishanlaoyao/elysia-admin"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-7 items-center opacity-90 transition hover:opacity-100"
            >
              <img
                class="h-7 w-auto max-w-none"
                src="https://img.shields.io/github/stars/meishanlaoyao/elysia-admin?style=flat-square&label=GitHub&logo=github&color=111111&labelColor=1a1a1a"
                alt="GitHub stars"
                height="28"
                loading="lazy"
              >
            </a>
            <a
              href="https://gitee.com/nian-qian/elysia-admin/stargazers"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-7 items-center opacity-90 transition hover:opacity-100"
            >
              <img
                class="h-7 w-auto max-w-none"
                :src="`https://gitee.com/nian-qian/elysia-admin/badge/star.svg?theme=${giteeBadgeTheme}`"
                alt="Gitee star"
                height="28"
                loading="lazy"
              >
            </a>
          </div>
          <p class="mt-3 w-full text-center text-[13px] leading-relaxed text-fg-faint md:mt-4">
            MIT 开源 · 代码托管 GitHub / Gitee · Node ≥22 · Bun ≥1.2.21 · PostgreSQL ≥16 · Redis ≥6
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
