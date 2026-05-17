<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import busuanzi from 'busuanzi.pure.js'
import { eaInitHomeScrollReveals } from '../../composables/useEaScrollReveal'
import SiteNav from '../SiteNav.vue'
import HomeHero from './HomeHero.vue'
import HomeFeaturesBento from './HomeFeaturesBento.vue'
import HomeCodePreview from './HomeCodePreview.vue'
import HomePerformance from './HomePerformance.vue'
import HomeEcosystem from './HomeEcosystem.vue'
import HomeAi from './HomeAi.vue'
import HomeDocsPreview from './HomeDocsPreview.vue'
import HomeFooter from './HomeFooter.vue'

onMounted(() => {
  busuanzi.fetch()
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        eaInitHomeScrollReveals()
      })
    })
  })
})
</script>

<template>
  <div
    class="ea-home min-h-screen bg-surface-0 font-sans text-fg antialiased selection:bg-brand/40 selection:text-ea-selection-fg"
  >
    <div
      class="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
      style="
        background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E');
      "
      aria-hidden="true"
    />
    <div class="relative z-10">
      <SiteNav />
      <main>
        <HomeHero />
        <HomeFeaturesBento />
        <HomeCodePreview />
        <HomePerformance />
        <HomeEcosystem />
        <HomeAi />
        <!-- <HomeDocsPreview /> -->
      </main>
      <HomeFooter />
    </div>
  </div>
</template>