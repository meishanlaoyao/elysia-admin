<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { withBase, useRoute } from 'vitepress'
import { Menu, X, Search, ChevronDown } from 'lucide-vue-next'
import { useEaVersion } from '../composables/useEaVersion'
import { eaExternalLinkAttrs } from '../shared/linkAttrs'
import EaDocSearch from './EaDocSearch.vue'
import EaThemeToggle from './EaThemeToggle.vue'

const props = withDefaults(
  defineProps<{
    /** 文档页无 Hero，顶栏始终使用实底样式 */
    solid?: boolean
  }>(),
  { solid: false },
)

const route = useRoute()
const { data: version } = useEaVersion()

type NavLink = { text: string; href: string }
type NavGroup = { text: string; items: NavLink[] }
type NavItem = NavLink | NavGroup

function isNavGroup(item: NavItem): item is NavGroup {
  return 'items' in item
}

const navItems: NavItem[] = [
  { text: '文档', href: '/start/quick-start' },
  { text: '介绍', href: '/start/introduction' },
  { text: 'AI', href: '/guide/ai-guide' },
  { text: '架构', href: '/architecture/structure' },
  {
    text: '生态',
    items: [
      { text: '业务包', href: '/ecosystem/business-packages' },
      { text: '相关链接', href: '/ecosystem/related-links' },
    ],
  },
  { text: '更新日志', href: '/start/change-log' },
]

const repoLinks = [
  { text: 'GitHub', href: 'https://github.com/meishanlaoyao/elysia-admin', icon: 'github' as const },
  { text: 'Gitee', href: 'https://gitee.com/nian-qian/elysia-admin', icon: 'gitee' as const },
]

const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

function setMenuOpen(open: boolean) {
  menuOpen.value = open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : ''
  }
}

function closeMenu() {
  setMenuOpen(false)
}

function toggleMenu() {
  setMenuOpen(!menuOpen.value)
}

function openDocSearch() {
  closeMenu()
  nextTick(() => {
    document.querySelector<HTMLButtonElement>('.ea-doc-search .DocSearch-Button')?.click()
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})

watch(
  () => route.path,
  () => closeMenu(),
)

const versionLink = computed(() => {
  const u = version.value?.changelogUrl
  if (u?.startsWith('http')) return u
  return withBase('/start/change-log')
})

const versionExternal = computed(() => version.value?.changelogUrl?.startsWith('http') ?? false)

const navElevated = computed(() => props.solid || scrolled.value || menuOpen.value)
</script>

<template>
  <header
    class="ea-site-nav relative sticky top-0 z-[60] overflow-visible border-b transition-all duration-400 ease-out"
    :class="[
      !navElevated
        ? 'border-transparent bg-transparent'
        : menuOpen
          ? 'border-ea bg-ea-nav-solid backdrop-blur-xl'
          : 'border-ea bg-ea-nav backdrop-blur-xl',
      menuOpen ? 'is-menu-open' : '',
    ]"
  >
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="menuOpen"
        id="ea-site-nav-backdrop"
        class="fixed bottom-0 left-0 right-0 z-0 lg:hidden"
        aria-hidden="true"
        @click="closeMenu"
      />
    </Transition>
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <nav
        v-if="menuOpen"
        id="ea-site-nav-drawer"
        class="absolute left-0 right-0 top-full z-[1] flex flex-col overflow-hidden lg:hidden"
      >
        <div class="ea-drawer-header mx-auto flex w-full max-w-content shrink-0 items-center justify-between">
          <span class="text-sm font-semibold text-fg">菜单</span>
        </div>
        <div class="ea-drawer-body mx-auto flex w-full max-w-content flex-1 flex-col gap-2 overflow-y-auto px-5 pb-6">
          <button
            type="button"
            class="ea-drawer-search"
            @click="openDocSearch"
          >
            <Search class="ea-drawer-search__icon" stroke-width="1.5" />
            <span class="ea-drawer-search__label">搜索文档…</span>
          </button>
          <EaThemeToggle block @toggled="closeMenu" />
          <template v-for="item in navItems" :key="item.text">
            <a
              v-if="!isNavGroup(item)"
              class="ea-drawer-link"
              :href="item.href"
              @click="closeMenu"
            >{{ item.text }}</a>
            <section v-else class="ea-drawer-nav-group">
              <p class="ea-drawer-section-title">
                {{ item.text }}
              </p>
              <a
                v-for="sub in item.items"
                :key="sub.text"
                class="ea-drawer-link ea-drawer-link--sub"
                :href="sub.href"
                @click="closeMenu"
              >{{ sub.text }}</a>
            </section>
          </template>
          <a
            class="ea-nav-btn ea-drawer-cta"
            href="/start/quick-start"
            @click="closeMenu"
          >快速开始</a>
          <section class="ea-drawer-section">
            <p class="ea-drawer-section-title">
              代码仓库
            </p>
            <div class="ea-drawer-repo-grid">
              <a
                v-for="r in repoLinks"
                :key="r.text"
                class="ea-drawer-repo-btn"
                :href="r.href"
                v-bind="eaExternalLinkAttrs(true)"
                @click="closeMenu"
              >
                <span
                  class="ea-drawer-repo-mark"
                  :class="r.icon === 'github' ? 'ea-drawer-repo-mark--github' : 'ea-drawer-repo-mark--gitee'"
                  aria-hidden="true"
                >{{ r.icon === 'github' ? 'GH' : 'G' }}</span>
                {{ r.text }}
              </a>
            </div>
          </section>
        </div>
      </nav>
    </Transition>
    <div
      class="ea-nav-bar relative z-10 mx-auto flex h-14 max-w-content items-center justify-between gap-3 px-5 md:h-16 md:gap-4 md:px-8"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2 lg:gap-4">
        <a href="/" class="flex min-w-0 shrink-0 items-center gap-2.5 text-[0.95rem] font-semibold tracking-tight text-fg">
          <img
            src="/logo.webp"
            alt="Elysia Admin"
            class="h-8 w-8 shrink-0 object-contain"
            width="32"
            height="32"
            decoding="async"
          >
          <span class="hidden truncate sm:inline">Elysia Admin</span>
        </a>
        <a
          v-if="version"
          :href="versionLink"
          class="hidden shrink-0 items-center rounded-full border border-ea-strong bg-ea-nav-btn px-2 py-0.5 font-mono text-[11px] text-brand md:inline-flex"
          v-bind="eaExternalLinkAttrs(versionExternal)"
        >v{{ version.version }}</a>
        <nav class="ml-0.5 hidden items-center gap-0.5 lg:flex">
          <template v-for="item in navItems" :key="item.text">
            <a
              v-if="!isNavGroup(item)"
              class="rounded-lg px-2.5 py-2 text-[13px] text-fg-muted transition-colors duration-400 ease-out hover:bg-ea-nav-hover hover:text-fg xl:px-3"
              :href="item.href"
            >{{ item.text }}</a>
            <div
              v-else
              class="ea-nav-dropdown group relative"
            >
              <button
                type="button"
                class="ea-nav-dropdown-trigger inline-flex items-center gap-0.5 rounded-lg px-2.5 py-2 text-[13px] text-fg-muted transition-colors duration-400 ease-out hover:bg-ea-nav-hover hover:text-fg xl:px-3"
                aria-haspopup="true"
              >
                {{ item.text }}
                <ChevronDown class="ea-nav-dropdown-icon h-3.5 w-3.5 opacity-60" stroke-width="2" />
              </button>
              <div class="ea-nav-dropdown-menu">
                <a
                  v-for="sub in item.items"
                  :key="sub.text"
                  class="ea-nav-dropdown-item"
                  :href="sub.href"
                >{{ sub.text }}</a>
              </div>
            </div>
          </template>
        </nav>
      </div>
      <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <a
          v-if="version"
          :href="versionLink"
          class="inline-flex shrink-0 rounded-full border border-ea-strong px-2 py-1 font-mono text-[11px] text-brand md:hidden"
          v-bind="eaExternalLinkAttrs(versionExternal)"
        >v{{ version.version }}</a>
        <div class="hidden items-center gap-1.5 sm:gap-2 lg:flex">
          <EaDocSearch />
          <a
            class="ea-nav-btn"
            href="/start/quick-start"
          >快速开始</a>
          <EaThemeToggle />
        </div>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ea-strong text-fg-muted transition hover:border-brand/40 hover:bg-ea-nav-hover hover:text-fg lg:hidden"
          :aria-expanded="menuOpen"
          aria-controls="ea-site-nav-drawer"
          aria-label="打开导航菜单"
          @click="toggleMenu"
        >
          <Menu v-if="!menuOpen" class="h-5 w-5" stroke-width="1.5" />
          <X v-else class="h-5 w-5" stroke-width="1.5" />
        </button>
      </div>
    </div>
  </header>
</template>
