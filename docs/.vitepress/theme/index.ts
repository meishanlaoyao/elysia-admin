// https://vitepress.dev/guide/custom-theme
import { h, onMounted, watch, nextTick } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { inBrowser } from 'vitepress'
import busuanzi from 'busuanzi.pure.js'
import { NProgress } from 'nprogress-v2/dist/index.js'
import mediumZoom from 'medium-zoom'
import { useRoute } from 'vitepress'
import './style/index.css'
import 'virtual:group-icons.css'
import 'nprogress-v2/dist/index.css'
import "vitepress-markdown-timeline/dist/theme/index.css"

import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(
      DefaultTheme.Layout,
      null,
      {
        // https://vitepress.dev/guide/extending-default-theme#layout-slots
        'layout-bottom': () => h(
          'div',
          {
            style: {
              textAlign: 'center',
              padding: '0.6rem',
              fontSize: '0.875rem',
              color: 'var(--vp-c-text-2)',
              borderTop: '1px solid var(--vp-c-divider)',
            }
          },
          [
            h('span', {}, '本站总访问量 '),
            h('span', { id: 'busuanzi_value_site_pv' }),
            h('span', {}, ' 次 本站访客数 '),
            h('span', { id: 'busuanzi_value_site_uv' }),
            h('span', {}, ' 人次')
          ]
        )
      }
    )
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
  },
  setup() {
    const route = useRoute();
    const initZoom = () => {
      mediumZoom('.main img', { background: 'rgba(0,0,0,0.8)' }); // 不显式添加{data-zoomable}的情况下为所有图像启用此功能
    };
    onMounted(() => {
      initZoom();
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );
  },
} satisfies Theme