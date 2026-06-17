<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import busuanzi from 'busuanzi.pure.js'
import { Package, Search, ArrowDown } from 'lucide-vue-next'
import SiteNav from './SiteNav.vue'
import BusinessPackageList from './BusinessPackageList.vue'
import { useBusinessPackages } from '../composables/useBusinessPackages'
import { eaExternalLinkAttrs } from '../shared/linkAttrs'

const { packages: businessPackages } = useBusinessPackages()
const query = ref('')

const filteredPackages = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return businessPackages.value
  return businessPackages.value.filter((pkg) => {
    const haystack = [pkg.name, pkg.description, pkg.author, ...pkg.eaVersions]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

const fieldRows = [
  { field: 'name', desc: '业务包名称' },
  { field: 'eaVersions', desc: '支持的 EA 版本（可多选）' },
  { field: 'description', desc: '简介' },
  { field: 'author', desc: '作者' },
  { field: 'cover', desc: '封面图 URL（可放 docs/public/business-packages/ 或使用外链）' },
  { field: 'url', desc: '跳转链接（仓库或文档地址）' },
  { field: 'badge', desc: '仓库 Star 挂件，支持 img URL 或 HTML 片段（如 shields.io github/stars）' },
]

onMounted(() => {
  busuanzi.fetch()
})
</script>

<template>
  <div
    class="ea-bp-page min-h-screen bg-surface-0 font-sans text-fg antialiased selection:bg-brand/40 selection:text-ea-selection-fg"
  >
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div class="absolute -right-1/4 top-0 h-[480px] w-[480px] rounded-full bg-brand/20 blur-[120px]"/>
      <div class="absolute -left-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-muted/15 blur-[100px]" />
    </div>
    <div class="relative z-10">
      <SiteNav solid />
      <main class="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-6 lg:px-8">
        <!-- Hero -->
        <header class="mb-10">
          <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div
                class="mb-3 inline-flex items-center gap-2 rounded-full border border-ea-strong bg-ea-surface-card px-3 py-1 text-xs font-medium text-fg-muted"
              >
                <Package class="h-3.5 w-3.5 text-brand" stroke-width="2" />
                社区生态
              </div>
              <h1 class="text-3xl font-bold tracking-tight text-fg sm:text-4xl">业务包</h1>
              <p class="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
                社区贡献的可复用业务模块集合。遇到类似业务时，可快速找到对应实现并直接拿来使用，减少重复造轮子。
              </p>
              <a
                href="#contribute"
                class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand/80"
              >
                如何贡献
                <ArrowDown class="h-4 w-4" stroke-width="2" />
              </a>
            </div>
            <div class="flex shrink-0 gap-3">
              <div
                class="rounded-xl border border-ea-strong bg-ea-surface-card px-5 py-3 text-center shadow-sm"
              >
                <div class="text-2xl font-bold tabular-nums text-brand">
                  {{ businessPackages.length }}
                </div>
                <div class="mt-0.5 text-xs text-fg-subtle">业务包</div>
              </div>
              <div
                class="rounded-xl border border-ea-strong bg-ea-surface-card px-5 py-3 text-center shadow-sm"
              >
                <div class="text-2xl font-bold tabular-nums text-brand">
                  {{ filteredPackages.length }}
                </div>
                <div class="mt-0.5 text-xs text-fg-subtle">当前显示</div>
              </div>
            </div>
          </div>

          <!-- Search -->
          <div class="relative mt-8 max-w-md">
            <Search
              class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
              stroke-width="2"
            />
            <input
              v-model="query"
              type="search"
              autocomplete="off"
              placeholder="搜索名称、简介、作者或 EA 版本…"
              class="w-full rounded-xl border border-ea-strong bg-surface-1 py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-subtle outline-none transition-[border-color,box-shadow] focus:border-brand/40 focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </header>

        <!-- Package grid -->
        <BusinessPackageList :items="filteredPackages" />

        <!-- Contribute -->
        <section
          id="contribute"
          class="mt-16 scroll-mt-24 rounded-2xl border border-ea-strong bg-surface-1 p-6 shadow-[0_24px_80px_-30px_rgba(128,82,228,0.15)] sm:p-8"
        >
          <h2 class="text-xl font-bold tracking-tight text-fg">贡献规范</h2>
          <p class="mt-2 text-sm text-fg-muted">欢迎提交你的业务包，审核通过后将展示在上方列表中。</p>
          <h3 class="mt-8 text-base font-semibold text-fg">目录结构</h3>
          <p class="mt-2 text-sm text-fg-muted">推荐按以下结构组织你的业务包：</p>
          <pre class="ea-bp-code mt-3 overflow-x-auto rounded-xl border border-ea-strong bg-ea-code-soft p-4 text-xs leading-relaxed text-fg-muted"><code>/your-package
├── server/      # 对应 Elysia Admin server 路径
├── admin/       # 对应 admin 路径
├── ...          # 其它目录（如有特殊说明写在 README）
└── README.md    # 必须：完整使用教程</code></pre>
          <p class="mt-3 text-sm text-fg-muted">
            其中 <strong class="font-medium text-fg">README.md 是核心</strong>，需包含完整的使用教程。`server/`、`admin/` 内文件应对应 Elysia Admin 的正常路径；若有特殊放置方式，请在 README 中说明。
          </p>
          <h3 class="mt-8 text-base font-semibold text-fg">README 最低要求</h3>
          <ul class="mt-3 list-inside list-disc space-y-1.5 text-sm text-fg-muted">
            <li>适用 EA 版本</li>
            <li>安装 / 集成步骤（含 SQL、菜单权限等如有）</li>
            <li>文件放置路径说明</li>
            <li>使用示例与注意事项</li>
          </ul>
          <h3 class="mt-8 text-base font-semibold text-fg">提交到文档站</h3>
          <ol class="mt-3 list-inside list-decimal space-y-1.5 text-sm text-fg-muted">
            <li>Fork 本仓库</li>
            <li>
              在
              <a
                href="https://gitee.com/nian-qian/elysia-admin/blob/main/docs/.vitepress/theme/data/business-packages.ts"
                class="text-brand hover:underline"
                v-bind="eaExternalLinkAttrs(true)"
              >docs/.vitepress/theme/data/business-packages.ts</a>
              追加一条记录
            </li>
            <li>提交 Pull Request，等待维护者审核</li>
          </ol>

          <h4 class="mt-6 text-sm font-semibold text-fg">每条记录字段说明</h4>
          <div class="mt-3 overflow-x-auto rounded-xl border border-ea-strong">
            <table class="ea-bp-table w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr class="border-b border-ea-strong bg-ea-panel-overlay">
                  <th class="px-4 py-2.5 font-semibold text-fg">字段</th>
                  <th class="px-4 py-2.5 font-semibold text-fg">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in fieldRows"
                  :key="row.field"
                  class="border-b border-ea-strong last:border-b-0"
                >
                  <td class="px-4 py-2.5 font-mono text-xs text-brand">{{ row.field }}</td>
                  <td class="px-4 py-2.5 text-fg-muted">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 class="mt-8 text-base font-semibold text-fg">封面与挂件</h3>
          <ul class="mt-3 list-inside list-disc space-y-1.5 text-sm text-fg-muted">
            <li>封面图建议尺寸 16:9，可上传至 <code class="ea-bp-inline-code">docs/public/business-packages/</code></li>
            <li>仓库 Star 挂件可使用 shields.io 的 <code class="ea-bp-inline-code">github/stars/owner/repo</code> badge，<code class="ea-bp-inline-code">&lt;img&gt;</code> 标签或图片 URL 均可</li>
          </ul>
        </section>
      </main>

      <footer class="ea-stats-footer border-t border-ea">
        <span>本站总访问量 </span>
        <span id="busuanzi_value_site_pv" />
        <span> 次 本站访客数 </span>
        <span id="busuanzi_value_site_uv" />
        <span> 人次</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.ea-bp-code code {
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
}

.ea-bp-inline-code {
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
  font-size: 0.8125rem;
  background: var(--ea-inline-code-bg);
  color: var(--ea-fg);
}

.ea-bp-table tbody tr {
  border-color: var(--ea-border-strong);
}
</style>