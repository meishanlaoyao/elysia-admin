<script setup lang="ts">
import { ref } from 'vue'
import { Terminal, Monitor } from 'lucide-vue-next'
import { useEaScrollReveal } from '../../composables/useEaScrollReveal'

const section = ref<HTMLElement | null>(null)
useEaScrollReveal(section)
</script>

<template>
  <section ref="section" class="border-b border-ea py-20 md:py-28">
    <div class="mx-auto max-w-content px-5 md:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="ea-scroll-head text-3xl font-bold tracking-tight text-fg md:text-4xl">
          几分钟跑起来
        </h2>
        <p class="ea-scroll-head mx-auto mt-3 max-w-2xl leading-[1.65] text-fg-muted md:leading-[1.7]">
          与《快速开始》一致：先克隆单仓（含
          <code class="rounded border border-ea-strong bg-ea-inline-code px-1.5 py-0.5 text-[13px] text-brand">
            admin/
          </code>
          、server、docs），再在仓库根目录用 Bun 启动 API，在
          <code class="rounded border border-ea-strong bg-ea-inline-code px-1.5 py-0.5 text-[13px] text-brand">
            admin/
          </code>
          用 pnpm 启动管理端；下方卡片先给克隆地址，再分左右命令。
        </p>
      </div>

      <div
        class="ea-scroll-block mt-12 overflow-hidden rounded-2xl border border-ea-strong bg-ea-terminal shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]">
        <div
          class="flex items-center gap-2 border-b border-ea bg-surface-2 px-4 py-3 text-[13px] text-fg-subtle">
          <span class="inline-flex h-3 w-3 rounded-full bg-red-500/80"></span>
          <span class="inline-flex h-3 w-3 rounded-full bg-amber-400/80"></span>
          <span class="inline-flex h-3 w-3 rounded-full bg-emerald-500/80"></span>
          <span class="ml-3 font-mono text-fg-faint">elysia-admin</span>
        </div>

        <div class="border-b border-ea p-5">
          <div class="mb-3 text-[13px] font-medium text-fg-muted">
            单仓克隆（二选一）
          </div>
          <pre
            class="overflow-x-auto whitespace-pre rounded-lg border border-ea bg-ea-code-soft p-4 font-mono text-[13px] leading-[1.65] text-ea-code-fg"><code><span class="text-fg-subtle"># GitHub</span>
<span class="text-emerald-400/95">git clone </span>
<span class="text-brand">https://github.com/meishanlaoyao/elysia-admin.git</span>
<span class="text-fg-subtle"># Gitee（国内镜像）</span>
<span class="text-emerald-400/95">git clone </span>
<span class="text-brand">https://gitee.com/nian-qian/elysia-admin.git</span>
</code></pre>
          <p class="mt-3 text-[12px] leading-relaxed text-fg-subtle">
            克隆后得到含 admin、server、docs 的完整仓库；下方左侧在<strong class="text-fg-muted">仓库根目录</strong>启动
            API，右侧在
            <code class="rounded border border-ea-strong bg-ea-inline-code px-1 py-0.5 text-[11px] text-brand">
              admin/
            </code>
            下启动前端。
          </p>
        </div>

        <div class="grid lg:grid-cols-2">
          <!-- 左：后端 -->
          <div class="border-b border-ea p-5 lg:border-b-0 lg:border-r lg:border-ea">
            <div class="mb-3 flex items-center gap-2 text-[13px] font-medium text-fg-muted">
              <Terminal class="h-4 w-4 text-brand" stroke-width="1.5" />
              <span>后端（server · Bun）</span>
            </div>
            <pre class="overflow-x-auto whitespace-pre rounded-lg border border-ea bg-ea-code-soft p-4 font-mono text-[13px] leading-[1.65] text-ea-code-fg"><code><span class="text-fg-subtle"># 进入后端目录</span>
<span class="text-emerald-400/95">cd server</span>
<span class="text-fg-subtle"># 安装依赖</span>
<span class="text-emerald-400/95">bun install</span>
<span class="text-fg-subtle"># 启动 后端 与 Worker</span>
<span class="text-emerald-400/95">bun dev:all</span>
<span class="text-fg-subtle"># 默认 </span><span class="text-brand">http://localhost:3000/api</span></code></pre>
            <p class="mt-3 text-[12px] leading-relaxed text-fg-subtle">
              启动成功后控制台会输出本地 API、OpenAPI 与 JSON 地址，详见
              <a class="text-brand hover:underline" href="/start/quick-start">快速开始</a>。
            </p>
          </div>

          <!-- 右：前端 -->
          <div class="p-5">
            <div class="mb-3 flex items-center gap-2 text-[13px] font-medium text-fg-muted">
              <Monitor class="h-4 w-4 text-brand" stroke-width="1.5" />
              <span>前端（admin · pnpm）</span>
            </div>
            <pre
              class="overflow-x-auto whitespace-pre rounded-lg border border-ea bg-ea-code-soft p-4 font-mono text-[13px] leading-[1.65] text-ea-code-fg"><code><span class="text-fg-subtle"># 进入前端目录</span>
<span class="text-emerald-400/95">cd admin</span>
<span class="text-fg-subtle"># 安装依赖</span>
<span class="text-emerald-400/95">pnpm install</span>
<span class="text-fg-subtle"># 启动后台管理端</span>
<span class="text-emerald-400/95">pnpm dev</span>
<span class="text-fg-subtle"># 默认 </span><span class="text-brand">http://localhost:3006</span></code></pre>
            <p class="mt-3 text-[12px] leading-relaxed text-fg-subtle">
              目录与命令与《快速开始》一致；生产环境变量等仍以
              <a class="text-brand hover:underline" href="/start/quick-start">文档</a>
              为准。
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
