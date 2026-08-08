<template>
  <div class="json-console" :class="{ 'is-open': open }">
    <div
      class="json-console__bar"
      role="button"
      tabindex="0"
      @click="open = !open"
      @keydown.enter.prevent="open = !open"
      @keydown.space.prevent="open = !open"
    >
      <div class="json-console__dots">
        <span class="dot red" />
        <span class="dot yellow" />
        <span class="dot green" />
      </div>
      <span class="json-console__title">{{ title }}</span>
      <span class="json-console__spacer" />
      <button
        type="button"
        class="json-console__copy"
        :class="{ 'is-copied': copied }"
        @click.stop="handleCopy"
      >
        <ArtSvgIcon :icon="copied ? 'ri:check-line' : 'ri:file-copy-line'" />
      </button>
      <ArtSvgIcon
        icon="ri:arrow-down-s-line"
        class="json-console__chevron"
        :class="{ 'is-open': open }"
      />
    </div>
    <Transition name="console-expand">
      <div v-show="open" class="json-console__body">
        <ElScrollbar :max-height="maxHeight">
          <pre class="json-console__pre">{{ content }}</pre>
        </ElScrollbar>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'PayDebugJsonConsole' })

  const props = withDefaults(
    defineProps<{
      content: string
      title?: string
      defaultOpen?: boolean
      maxHeight?: string
    }>(),
    {
      title: 'Response JSON',
      defaultOpen: true,
      maxHeight: '160px'
    }
  )

  const open = ref(props.defaultOpen)
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  async function handleCopy() {
    if (!props.content) return
    try {
      await navigator.clipboard.writeText(props.content)
      copied.value = true
      ElMessage.success('已复制 JSON')
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = false
      }, 1600)
    } catch {
      ElMessage.error('复制失败')
    }
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })
</script>

<style scoped lang="scss">
  .json-console {
    border-radius: 10px;
    overflow: hidden;
    background: #0f1117;
    border: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .json-console__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    color: rgba(255, 255, 255, 0.72);
    text-align: left;
  }

  .json-console__dots {
    display: flex;
    gap: 5px;
    flex-shrink: 0;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.red {
      background: #ff5f56;
    }

    &.yellow {
      background: #ffbd2e;
    }

    &.green {
      background: #27c93f;
    }
  }

  .json-console__title {
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    letter-spacing: 0.02em;
  }

  .json-console__spacer {
    flex: 1;
  }

  .json-console__copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, 0.55);
    cursor: pointer;
    transition:
      color 0.2s ease,
      background 0.2s ease,
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    &.is-copied {
      color: #27c93f;
      transform: scale(1.1);
    }
  }

  .json-console__chevron {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.45);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &.is-open {
      transform: rotate(180deg);
    }
  }

  .json-console__body {
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .json-console__pre {
    margin: 0;
    padding: 10px 12px;
    font-size: 11px;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-all;
    color: #a8e6cf;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .console-expand-enter-active,
  .console-expand-leave-active {
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .console-expand-enter-from,
  .console-expand-leave-to {
    opacity: 0;
    max-height: 0;
  }

  .console-expand-enter-to,
  .console-expand-leave-from {
    opacity: 1;
    max-height: 200px;
  }

  @media (prefers-reduced-motion: reduce) {
    .console-expand-enter-active,
    .console-expand-leave-active,
    .json-console__chevron,
    .json-console__copy {
      transition: none;
    }
  }

  .dark .json-console {
    background: #0a0b0f;
    border-color: rgba(255, 255, 255, 0.1);
  }
</style>
