<script setup lang="ts">
import { withBase } from 'vitepress'
import { Download } from 'lucide-vue-next'

const llmsUrl = withBase('/llms.txt')
const llmsFullUrl = withBase('/llms-full.txt')
</script>

<template>
  <div class="ea-llms-download not-prose my-6">
    <p class="mb-4 text-[14px] leading-relaxed text-fg-muted">
      <strong class="text-fg">llms.txt</strong>：全站页面目录与链接索引，适合作为 AI 上下文前缀。
      <strong class="text-fg">llms-full.txt</strong>：各页正文合并的完整文本，体积更大、信息更全。
    </p>
    <div class="flex flex-wrap gap-3">
      <a
        :href="llmsUrl"
        download="llms.txt"
        class="ea-nav-btn inline-flex items-center gap-2"
      >
        <Download class="h-4 w-4 shrink-0" stroke-width="1.5" />
        下载 llms.txt
      </a>
      <a
        :href="llmsFullUrl"
        download="llms-full.txt"
        class="ea-nav-btn inline-flex items-center gap-2"
      >
        <Download class="h-4 w-4 shrink-0" stroke-width="1.5" />
        下载 llms-full.txt
      </a>
    </div>
  </div>
</template>
