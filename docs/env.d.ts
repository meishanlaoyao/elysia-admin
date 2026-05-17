/// <reference types="vite/client" />
/// <reference path=".vitepress/theme/types/shims.d.ts" />
/// <reference path=".vitepress/theme/types/vitepress-layout.d.ts" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
