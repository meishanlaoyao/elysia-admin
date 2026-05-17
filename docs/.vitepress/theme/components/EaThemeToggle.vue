<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useEaTheme } from '../composables/useEaTheme'

const props = withDefaults(
  defineProps<{
    block?: boolean
  }>(),
  { block: false },
)

const emit = defineEmits<{
  toggled: []
}>()

const { theme, toggleTheme } = useEaTheme()

const isDark = computed(() => theme.value === 'dark')

const label = computed(() =>
  isDark.value ? '切换到浅色模式' : '切换到深色模式',
)

function onClick(event: MouseEvent) {
  toggleTheme(event)
  emit('toggled')
}
</script>

<template>
  <button
    type="button"
    class="ea-theme-toggle"
    :class="block ? 'ea-theme-toggle--block' : ''"
    :aria-label="label"
    :title="label"
    @click="onClick"
  >
    <Sun v-if="isDark" class="h-[18px] w-[18px]" stroke-width="1.5" />
    <Moon v-else class="h-[18px] w-[18px]" stroke-width="1.5" />
    <span v-if="block" class="ea-theme-toggle__label">{{ isDark ? '浅色模式' : '深色模式' }}</span>
  </button>
</template>
