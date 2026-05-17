import { ref, readonly, computed } from 'vue'

export type EaTheme = 'dark' | 'light'

const STORAGE_KEY = 'ea-theme'
const VP_STORAGE_KEY = 'vitepress-theme-appearance'

const theme = ref<EaTheme>('dark')

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function readStoredTheme(): EaTheme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    const vp = localStorage.getItem(VP_STORAGE_KEY)
    if (vp === 'light') return 'light'
  } catch {
    /* ignore */
  }
  return 'dark'
}

export function applyEaTheme(next: EaTheme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (next === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  try {
    localStorage.setItem(STORAGE_KEY, next)
    localStorage.setItem(VP_STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  theme.value = next
}

export function initEaTheme() {
  applyEaTheme(readStoredTheme())
}

function circleRevealTransition(event: MouseEvent | undefined, update: () => void) {
  if (
    prefersReducedMotion()
    || typeof document === 'undefined'
    || !document.startViewTransition
  ) {
    update()
    return
  }

  const x = event?.clientX ?? window.innerWidth / 2
  const y = event?.clientY ?? window.innerHeight / 2
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )

  const transition = document.startViewTransition(() => {
    update()
  })

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 560,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }).catch(() => {
    /* aborted */
  })
}

export function toggleEaTheme(event?: MouseEvent) {
  const next: EaTheme = theme.value === 'dark' ? 'light' : 'dark'
  circleRevealTransition(event, () => applyEaTheme(next))
}

export function useEaTheme() {
  const isDark = computed(() => theme.value === 'dark')
  return {
    theme: readonly(theme),
    isDark,
    toggleTheme: toggleEaTheme,
    applyTheme: applyEaTheme,
  }
}
