<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vitepress'
import { ArrowUp } from 'lucide-vue-next'
import { eaScrollToTop } from '../composables/useEaScrollToTop'

const SHOW_AFTER_PX = 400

const route = useRoute()
const visible = ref(false)

const isDocPage = computed(
  () => route.path !== '/' && route.path !== '/index.html',
)

function updateVisible() {
  visible.value = window.scrollY > SHOW_AFTER_PX
}

function onClick() {
  eaScrollToTop()
}

onMounted(() => {
  updateVisible()
  window.addEventListener('scroll', updateVisible, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateVisible)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <button
      v-show="visible"
      type="button"
      class="ea-back-to-top"
      :class="isDocPage ? 'ea-back-to-top--doc' : ''"
      aria-label="返回顶部"
      title="返回顶部"
      @click="onClick"
    >
      <ArrowUp class="h-5 w-5" stroke-width="1.75" />
    </button>
  </Transition>
</template>
