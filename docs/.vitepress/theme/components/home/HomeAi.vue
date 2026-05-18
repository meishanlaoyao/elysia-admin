<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileCode2, BookOpen, Layers, Sparkles } from 'lucide-vue-next'
import { useEaScrollReveal } from '../../composables/useEaScrollReveal'
import { useEaTheme } from '../../composables/useEaTheme'

const items = [
  {
    icon: Layers,
    title: '.ai/ 与 IDE 规则',
    text: '仓库内 `.ai/` 规范与 Cursor / Trae / Kiro 规则对齐，生成行为与 `AI_CODE_EXAMPLES.md` 一致。',
  },
  {
    icon: FileCode2,
    title: '代码模板唯一详版',
    text: '长模板以 `.ai/AI_CODE_EXAMPLES.md` 为准；运维与 MCP 等短约定见 `AI_CONTEXT_CAPSULE.md` 按需阅读。',
  },
  {
    icon: BookOpen,
    title: '前后端生成边界',
    text: '规则文件按路径触发：`general` 管架构与读文件纪律，`backend` / `frontend` 分管 server 与 admin。',
  },
  {
    icon: Sparkles,
    title: '提示词与协作',
    text: '在对应 IDE 中开箱加载规则，减少「与仓库风格不一致」的重复劳动。',
  },
]

const section = ref<HTMLElement | null>(null)
const { isDark } = useEaTheme()
const aiImgSrc = computed(() =>
  isDark.value ? '/home/4-dark.webp' : '/home/4.webp',
)
useEaScrollReveal(section)
</script>

<template>
  <section ref="section" class="border-b border-ea py-20 md:py-28">
    <div class="mx-auto max-w-content px-5 md:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="ea-scroll-head text-3xl font-bold tracking-tight text-fg md:text-4xl">
          AI 开发指南
        </h2>
        <p class="ea-scroll-head mx-auto mt-3 max-w-2xl text-base leading-[1.65] text-fg-muted md:text-lg md:leading-[1.7]">
          与站内文档
          <a class="text-brand hover:underline" href="/guide/ai-guide">《AI 开发指南》</a>
          一致：用项目自带规范约束 AI 生成代码，而不是泛泛的「AI 原生」口号。
        </p>
      </div>

      <div class="mt-14 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <ul class="space-y-5">
            <li v-for="it in items" :key="it.title" class="ea-scroll-item flex gap-4">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-brand">
                <component :is="it.icon" class="h-5 w-5" stroke-width="1.5" />
              </div>
              <div>
                <p class="font-semibold text-fg">
                  {{ it.title }}
                </p>
                <p class="mt-1 text-sm leading-relaxed text-fg-muted">
                  {{ it.text }}
                </p>
              </div>
            </li>
          </ul>
          <a href="/guide/ai-guide" class="mt-8 inline-flex text-sm font-medium text-brand hover:underline">打开完整 AI
            开发指南</a>
        </div>
        <div class="ea-scroll-block">
          <img :src="aiImgSrc" alt="IDE 规则或 .ai 目录结构示意图（Cursor / 规则文件树）" class="w-full" >
        </div>
      </div>
    </div>
  </section>
</template>
