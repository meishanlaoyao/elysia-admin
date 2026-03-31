<!-- 图标组件 -->
<template>
  <Icon v-if="icon" :icon="icon" v-bind="$attrs" class="art-svg-icon inline" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineOptions({ name: 'ArtSvgIcon', inheritAttrs: false })

interface Props {
  /** Iconify icon name */
  icon?: string
}

defineProps<Props>()
</script>
