declare module 'busuanzi.pure.js' {
  export function fetch(): void
}

declare module 'medium-zoom' {
  type MediumZoomSelector = string | HTMLElement | HTMLElement[]
  interface MediumZoomOptions {
    background?: string
    margin?: number
    scrollOffset?: number
    container?: HTMLElement | null
    template?: string | null
  }
  interface MediumZoom {
    (selector?: MediumZoomSelector, options?: MediumZoomOptions): MediumZoom
    attach: (selector?: MediumZoomSelector) => MediumZoom
    detach: (selector?: MediumZoomSelector) => MediumZoom
    update: (options?: MediumZoomOptions) => MediumZoom
    close: () => Promise<void>
    open: (args?: { target: HTMLElement }) => Promise<void>
  }
  const mediumZoom: MediumZoom
  export default mediumZoom
}

declare module 'nprogress-v2/dist/index.js' {
  interface NProgressOptions {
    showSpinner?: boolean
    minimum?: number
    easing?: string
    speed?: number
    trickle?: boolean
    trickleSpeed?: number
  }
  export const NProgress: {
    configure(options: NProgressOptions): void
    start(): void
    done(): void
    set(n: number): void
    inc(amount?: number): void
    remove(): void
    isStarted(): boolean
  }
}
