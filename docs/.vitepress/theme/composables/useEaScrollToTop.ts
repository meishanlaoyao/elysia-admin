let scrollToTopImpl: () => void = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function registerEaScrollToTop(fn: () => void) {
  scrollToTopImpl = fn
}

export function eaScrollToTop() {
  scrollToTopImpl()
}
