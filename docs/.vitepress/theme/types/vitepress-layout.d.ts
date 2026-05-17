import type { DefineComponent, Slot } from 'vue'

declare module 'vitepress/theme' {
  export const Layout: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown,
    {},
    {},
    {},
    {},
    {
      'layout-top'?: Slot
      'layout-bottom'?: Slot
    }
  >
}
