// https://vitepress.dev/guide/custom-theme
import { onMounted, watch, nextTick } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { inBrowser, useRoute } from 'vitepress'
import busuanzi from 'busuanzi.pure.js'
import { NProgress } from 'nprogress-v2/dist/index.js'
import mediumZoom from 'medium-zoom'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

import AppLayout from './components/AppLayout.vue'
import EaLlmsDownload from './components/EaLlmsDownload.vue'
import { initEaTheme } from './composables/useEaTheme'
import { registerEaScrollToTop } from './composables/useEaScrollToTop'

import 'nprogress-v2/dist/index.css'
import './style/theme-tokens.css'
import './style/fonts.css'
import './style/tailwind.css'
import './style/index.css'
import 'virtual:group-icons.css'
import 'vitepress-markdown-timeline/dist/theme/index.css'

import type { Theme } from 'vitepress'

let lenisInstance: Lenis | null = null
let lenisTicker: ((time: number) => void) | null = null
let lenisActiveForHome = false

/** 嵌套滚动区域：不交给 Lenis，避免侧栏有滚动条却滚不动正文 */
const LENIS_NESTED_SCROLL_SELECTOR =
  '.VPSidebar, .aside-container, .VPLocalSearchBox, .VPLocalNav, #ea-site-nav-drawer, [data-lenis-prevent]'

function isHomePath(path: string) {
  return path === '/' || path === '/index.html'
}

function shouldPreventLenisScroll(node: HTMLElement) {
  return Boolean(node.closest(LENIS_NESTED_SCROLL_SELECTOR))
}

function attachLenisTicker(lenis: Lenis) {
  if (lenisTicker) return
  gsap.ticker.lagSmoothing(0)
  lenisTicker = (time: number) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(lenisTicker)
}

function detachLenisTicker() {
  if (!lenisTicker) return
  gsap.ticker.remove(lenisTicker)
  lenisTicker = null
}

/** Lenis 官方 GSAP 集成：仅首页启用 */
function setupLenisGsap(lenis: Lenis) {
  lenis.on('scroll', () => {
    if (lenisActiveForHome) ScrollTrigger.update()
  })
}

function createLenis() {
  const lenis = new Lenis({
    smoothWheel: true,
    touchMultiplier: 1.5,
    prevent: (node) => node instanceof HTMLElement && shouldPreventLenisScroll(node),
  })
  setupLenisGsap(lenis)
  return lenis
}

/**
 * 文档页必须 destroy 而非 stop：stop() 会加 lenis-stopped + overflow:clip 并拦截滚轮，导致无法滚动
 */
function destroyLenis() {
  lenisActiveForHome = false
  detachLenisTicker()
  if (!lenisInstance) return
  lenisInstance.destroy()
  lenisInstance = null
}

function enableLenisForHome() {
  if (!lenisInstance) lenisInstance = createLenis()
  lenisActiveForHome = true
  lenisInstance.start()
  attachLenisTicker(lenisInstance)
}

function setLenisForRoute(path: string) {
  if (isHomePath(path)) enableLenisForHome()
  else destroyLenis()
}

function scrollToTop(path: string) {
  if (isHomePath(path)) {
    lenisInstance?.scrollTo(0, { immediate: true })
  } else {
    window.scrollTo(0, 0)
  }
}

function eaBackToTopScroll() {
  const instant =
    typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lenisActiveForHome && lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: instant })
  } else {
    window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' })
  }
}

export default {
  extends: DefaultTheme,
  Layout: AppLayout,
  enhanceApp({ app, router }) {
    if (inBrowser) {
      initEaTheme()
      app.component('EaLlmsDownload', EaLlmsDownload)
      registerEaScrollToTop(eaBackToTopScroll)
      NProgress.configure({ showSpinner: false })
      router.onBeforeRouteChange = () => {
        NProgress.start()
      }
      router.onAfterRouteChanged = () => {
        busuanzi.fetch()
        NProgress.done()
        const path = router.route.path
        setLenisForRoute(path)
        scrollToTop(path)
      }
      setLenisForRoute(router.route.path)
    }
  },
  setup() {
    const route = useRoute()
    const initZoom = () => {
      mediumZoom('.main img', { background: 'rgba(0,0,0,0.8)' })
    }
    onMounted(() => {
      initZoom()
    })
    watch(
      () => route.path,
      () => nextTick(() => initZoom()),
    )
  },
} satisfies Theme