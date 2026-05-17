<script setup lang="ts">
import { ref } from 'vue'
import { useEaVersion } from '../../composables/useEaVersion'
import { useEaScrollReveal } from '../../composables/useEaScrollReveal'
import { eaExternalLinkAttrs } from '../../shared/linkAttrs'

type FooterLink = {
  text: string
  href: string
  ext?: boolean
}

type FooterColumn = {
  title: string
  links: FooterLink[]
}

const { data: version } = useEaVersion()

const footerEl = ref<HTMLElement | null>(null)
useEaScrollReveal(footerEl, { skipHead: true, itemsY: 12 })

const cols: FooterColumn[] = [
  {
    title: '项目',
    links: [
      { text: 'GitHub', href: 'https://github.com/meishanlaoyao/elysia-admin', ext: true },
      { text: 'Gitee', href: 'https://gitee.com/nian-qian/elysia-admin', ext: true },
      { text: '在线演示', href: 'https://demo.elysia-admin.top/admin', ext: true },
    ],
  },
  {
    title: '文档',
    links: [
      { text: '快速开始', href: '/start/quick-start' },
      { text: '介绍', href: '/start/introduction' },
      { text: '更新日志', href: '/start/change-log' },
      { text: '常见问题', href: '/other/faq' },
    ],
  },
  {
    title: '社区',
    links: [
      { text: '相关链接', href: '/other/related-links' },
      { text: '社交', href: '/other/social' },
    ],
  },
]

</script>

<template>
  <footer
    ref="footerEl"
    class="border-t border-ea bg-gradient-to-b from-surface-0 to-surface-1 pb-12 pt-16"
  >
    <div class="mx-auto max-w-content px-5 md:px-8">
      <div class="grid gap-10 md:grid-cols-4">
        <div class="ea-scroll-item md:col-span-1">
          <p class="text-sm font-semibold text-fg">
            Elysia Admin
          </p>
          <p class="mt-3 text-sm leading-relaxed text-fg-subtle">
            Released under the MIT License.
          </p>
          <p v-if="version?.description" class="mt-3 text-xs leading-relaxed text-fg-faint">
            当前文档站对应发行说明：{{ version.description }}
          </p>
        </div>
        <div v-for="col in cols" :key="col.title" class="ea-scroll-item md:col-span-1">
          <p class="text-[13px] font-semibold uppercase tracking-wider text-fg-faint">
            {{ col.title }}
          </p>
          <ul class="mt-4 space-y-2">
            <li v-for="l in col.links" :key="l.text">
              <a
                class="text-sm text-fg-muted transition hover:text-fg"
                :href="l.href"
                v-bind="eaExternalLinkAttrs(l.ext)"
              >{{ l.text }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="mt-12 border-t border-ea pt-8 text-center text-[13px] text-fg-subtle"
      >
        <p>
          Copyright © 2026 Elysia Admin ·
          <a
            class="hover:text-fg"
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
          >湘ICP备2026013170号-1</a>
        </p>
        <p class="mt-3 text-fg-faint">
          本站总访问量
          <span id="busuanzi_value_site_pv" class="mx-1 font-medium text-brand"></span>
          次 · 访客
          <span id="busuanzi_value_site_uv" class="mx-1 font-medium text-brand"></span>
          人次
        </p>
      </div>
    </div>
  </footer>
</template>
