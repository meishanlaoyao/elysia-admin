import { onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let pluginReady = false
const setupQueue: Array<() => void> = []

function ensureScrollTrigger() {
  if (!pluginReady) {
    gsap.registerPlugin(ScrollTrigger)
    pluginReady = true
  }
}

export function eaPrefersReducedMotion() {
  return (
    typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export type EaScrollRevealOptions = {
  /** 为 true 时不动画标题区 */
  skipHead?: boolean
  head?: string
  items?: string
  block?: string
  /** ScrollTrigger 锚点：默认 section 内第一个 .ea-scroll-head */
  trigger?: 'head' | 'section' | string
  start?: string
  headY?: number
  itemsY?: number
  blockY?: number
}

function resolveTriggerEl(
  section: HTMLElement,
  trigger: 'head' | 'section' | string | undefined,
  selectors: { skipHead: boolean; head: string; items: string },
): HTMLElement {
  if (trigger === 'section') return section
  if (trigger && trigger !== 'head') {
    return (section.querySelector(trigger) as HTMLElement | null) ?? section
  }
  const headEl = section.querySelector(selectors.head) as HTMLElement | null
  if (headEl) return headEl
  if (selectors.skipHead) {
    const itemEl = section.querySelector(selectors.items) as HTMLElement | null
    if (itemEl) return itemEl
  }
  return section
}

const EASE = 'power3.out'

function scheduleScrollReveal(setup: () => void) {
  setupQueue.push(setup)
}

/**
 * 首页所有 section 挂载完成后再创建 ScrollTrigger（避免 refresh 打断 Bento 等首段动画）
 */
export function eaInitHomeScrollReveals() {
  ensureScrollTrigger()
  const setups = setupQueue.splice(0, setupQueue.length)
  setups.forEach((fn) => fn())
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
}

/** @deprecated 请用 eaInitHomeScrollReveals */
export function eaRefreshScrollTriggers() {
  ensureScrollTrigger()
  ScrollTrigger.refresh()
}

/**
 * Section 滚动入场：预藏 → 单 timeline 顺序显现
 */
export function useEaScrollReveal(
  sectionRef: Ref<HTMLElement | null>,
  options: EaScrollRevealOptions = {},
) {
  const {
    skipHead = false,
    head = '.ea-scroll-head',
    items = '.ea-scroll-item',
    block = '.ea-scroll-block',
    trigger: triggerAnchor = 'head',
    start = 'top 78%',
    headY = 24,
    itemsY = 20,
    blockY = 28,
  } = options

  let ctx: gsap.Context | null = null

  function buildReveal() {
    const el = sectionRef.value
    if (!el) return

    ctx = gsap.context(() => {
      const heads = skipHead || !head ? [] : Array.from(el.querySelectorAll(head))
      const list = Array.from(el.querySelectorAll(items))
      const blocks = Array.from(el.querySelectorAll(block))

      if (!heads.length && !list.length && !blocks.length) return

      if (heads.length) gsap.set(heads, { autoAlpha: 0, y: headY })
      if (list.length) gsap.set(list, { autoAlpha: 0, y: itemsY })
      if (blocks.length) gsap.set(blocks, { autoAlpha: 0, y: blockY })

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: EASE },
      })

      if (heads.length) {
        tl.to(heads, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.08,
          clearProps: 'transform',
        })
      }

      if (list.length) {
        tl.to(
          list,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.06,
            clearProps: 'transform',
          },
          heads.length ? '-=0.45' : 0,
        )
      }

      if (blocks.length) {
        tl.to(
          blocks,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            clearProps: 'transform',
          },
          heads.length || list.length ? '-=0.35' : 0,
        )
      }

      const triggerEl = resolveTriggerEl(el, triggerAnchor, { skipHead, head, items })

      ScrollTrigger.create({
        trigger: triggerEl,
        start,
        once: true,
        animation: tl,
        invalidateOnRefresh: true,
      })
    }, el)
  }

  onMounted(() => {
    if (eaPrefersReducedMotion()) return
    ensureScrollTrigger()
    scheduleScrollReveal(buildReveal)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}
