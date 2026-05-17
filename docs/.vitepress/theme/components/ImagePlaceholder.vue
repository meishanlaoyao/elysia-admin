<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    /** tailwind-ish bg class e.g. bg-brand/20 */
    tone?: string
    /** Tailwind min-height classes，给设计参考占位区域高度 */
    minHeightClass?: string
    /** 文案里展示的建议高度说明 */
    suggestedHeightLabel?: string
  }>(),
  {
    tone: 'bg-ea-placeholder',
    minHeightClass: 'min-h-[200px] md:min-h-[260px]',
    suggestedHeightLabel: '约 220–280px 高（横版 16:9 可配 960×540）',
  },
)
</script>

<template>
  <div
    class="ea-placeholder flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-ea-strong px-4 py-8 text-center text-sm text-fg-muted"
    :class="[tone, minHeightClass]"
  >
    <span class="max-w-md leading-relaxed">图片占位：{{ label }}</span>
    <span class="text-xs text-fg-faint">建议高度：{{ suggestedHeightLabel }}</span>
  </div>
</template>
