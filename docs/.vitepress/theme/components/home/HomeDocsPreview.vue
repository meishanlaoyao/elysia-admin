<script setup lang="ts">
import { ref } from 'vue'
import ImagePlaceholder from '../ImagePlaceholder.vue'
import { useEaScrollReveal } from '../../composables/useEaScrollReveal'

const menu = [
  { text: '快速开始', href: '/start/quick-start' },
  { text: '介绍', href: '/start/introduction' },
  { text: '第一个接口', href: '/guide/first-api' },
  { text: '数据库操作', href: '/guide/database-operation' },
  { text: '部署', href: '/guide/deploy' },
  { text: '队列', href: '/guide/queue' },
  { text: 'AI 开发', href: '/guide/ai-guide' },
  { text: '更新日志', href: '/start/change-log' },
]

const section = ref<HTMLElement | null>(null)
useEaScrollReveal(section)
</script>

<template>
  <section ref="section" class="border-b border-ea py-20 md:py-28">
    <div class="mx-auto max-w-content px-5 md:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="ea-scroll-head text-3xl font-bold tracking-tight text-fg md:text-4xl">
          文档结构
        </h2>
        <p class="ea-scroll-head mx-auto mt-3 max-w-2xl leading-[1.65] text-fg-muted md:leading-[1.7]">
          侧栏与路由与当前 VitePress 站点一致（见站内目录与
          <span class="text-fg">llms.txt</span>
          索引）；以下为高频入口链接预览。
        </p>
      </div>

      <div
        class="ea-scroll-block mt-12 overflow-hidden rounded-2xl border border-ea-strong bg-surface-1 shadow-[0_24px_80px_-30px_rgba(128,82,228,0.25)]"
      >
        <div class="grid md:grid-cols-[220px_1fr]">
          <aside
            class="border-b border-ea bg-ea-panel-overlay p-4 text-[13px] text-fg-subtle md:border-b-0 md:border-r"
          >
            <p class="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
              文档目录
            </p>
            <ul class="space-y-1">
              <li v-for="(item, i) in menu" :key="item.href">
                <a
                  class="block rounded-lg px-2 py-2 transition hover:bg-ea-inline-code hover:text-fg"
                  :class="i === 0 ? 'bg-ea-inline-code text-fg' : ''"
                  :href="item.href"
                >{{ item.text }}</a>
              </li>
            </ul>
          </aside>
          <div class="min-h-[280px] p-6 md:p-8">
            <p class="text-sm font-medium text-fg-subtle">
              正文预览
            </p>
            <p class="mt-2 text-lg font-semibold text-fg">
              OpenAPI 与本地联调
            </p>
            <p class="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
              后端启动后，控制台会打印 API 根路径、OpenAPI 与 JSON 导出地址（与《快速开始》示例输出一致），便于前端与第三方工具拉取契约。
            </p>
            <div class="mt-6 rounded-xl border border-ea bg-ea-code-soft p-4 font-mono text-[12px] leading-relaxed text-fg">
              <span class="text-brand">GET</span> /api/health ·
              <a class="text-fg-muted hover:text-brand" href="/guide/first-api">第一个接口</a>
              ·
              <a class="text-fg-muted hover:text-brand" href="/architecture/structure">项目结构</a>
            </div>
            <div class="mt-8">
              <ImagePlaceholder
                label="真实文档页截图：侧栏 + 正文 + 代码块 + 大纲"
                tone="bg-ea-placeholder"
                min-height-class="min-h-[220px] md:min-h-[280px]"
                suggested-height-label="约 260–320px 高，建议与桌面端视口宽度成比例截取"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
