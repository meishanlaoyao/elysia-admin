// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { inBrowser } from 'vitepress'
import busuanzi from 'busuanzi.pure.js'
import { NProgress } from 'nprogress-v2/dist/index.js'
import './style.css'
import 'virtual:group-icons.css'
import 'nprogress-v2/dist/index.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-bottom': () => h('div', {
        style: {
          textAlign: 'center',
          padding: '1rem 0',
          fontSize: '0.875rem',
          color: 'var(--vp-c-text-2)',
          borderTop: '1px solid var(--vp-c-divider)',
          marginTop: '2rem'
        }
      }, [
        h('span', {}, '本站总访问量 '),
        h('span', { id: 'busuanzi_value_site_pv' }),
        h('span', {}, ' 次 本站访客数 '),
        h('span', { id: 'busuanzi_value_site_uv' }),
        h('span', {}, ' 人次')
      ])
    })
  },
  enhanceApp({ app, router, siteData }) {
    if (inBrowser) {
      NProgress.configure({ showSpinner: false })
      router.onBeforeRouteChange = () => {
        NProgress.start() // 开始进度条
      }
      router.onAfterRouteChanged = () => {
        busuanzi.fetch()
        NProgress.done() // 停止进度条
      }
    }
  }
} satisfies Theme