<script setup lang="ts">
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import HomePage from './home/HomePage.vue'
import SiteNav from './SiteNav.vue'
import EaBackToTop from './EaBackToTop.vue'

const route = useRoute()
const DefaultLayout = DefaultTheme.Layout
</script>

<template>
  <EaBackToTop />
  <HomePage v-if="route.path === '/' || route.path === '/index.html'" />
  <DefaultLayout v-else class="ea-doc">
    <template #layout-top>
      <SiteNav solid />
    </template>
    <template #layout-bottom>
      <div class="ea-stats-footer">
        <span>本站总访问量 </span>
        <span id="busuanzi_value_site_pv"></span>
        <span> 次 本站访客数 </span>
        <span id="busuanzi_value_site_uv"></span>
        <span> 人次</span>
      </div>
    </template>
  </DefaultLayout>
</template>
