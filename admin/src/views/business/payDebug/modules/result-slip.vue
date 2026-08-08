<template>
  <div class="result-slip" :class="{ 'is-success': tone === 'success' }">
    <div class="result-slip__top">
      <span class="result-slip__label">{{ label }}</span>
      <button
        type="button"
        class="result-slip__copy"
        :class="{ 'is-copied': copied }"
        @click="handleCopy"
      >
        <ArtSvgIcon
          :icon="copied ? 'ri:check-line' : 'ri:file-copy-line'"
          class="result-slip__icon"
        />
        <span>{{ copied ? '已复制' : '复制' }}</span>
      </button>
    </div>
    <div class="result-slip__value">{{ value }}</div>
    <div v-if="$slots.actions" class="result-slip__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'PayDebugResultSlip' })

  const props = withDefaults(
    defineProps<{
      label: string
      value: string
      tone?: 'default' | 'success'
    }>(),
    { tone: 'default' }
  )

  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  async function handleCopy() {
    if (!props.value) return
    try {
      await navigator.clipboard.writeText(props.value)
      copied.value = true
      ElMessage.success('已复制')
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
  .result-slip {
    position: relative;
    padding: 12px 14px;
    border-radius: 10px;
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--el-color-primary) 6%, transparent),
        transparent 60%
      ),
      var(--el-fill-color-light);
    border: 1px dashed var(--art-card-border);
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: -20px;
      right: -20px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
      pointer-events: none;
    }

    &.is-success {
      background:
        linear-gradient(
          135deg,
          color-mix(in srgb, var(--el-color-success) 8%, transparent),
          transparent 60%
        ),
        var(--el-fill-color-light);
      border-color: color-mix(in srgb, var(--el-color-success) 35%, var(--art-card-border));

      &::after {
        background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
      }
    }
  }

  .result-slip__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  .result-slip__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  .result-slip__copy {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    cursor: pointer;
    transition:
      color 0.2s ease,
      background 0.2s ease,
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      background: var(--art-hover-color);
      color: var(--el-color-primary);
    }

    &.is-copied {
      color: var(--el-color-success);
      transform: scale(1.05);
    }
  }

  .result-slip__icon {
    font-size: 14px;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .is-copied .result-slip__icon {
    transform: scale(1.15);
  }

  .result-slip__value {
    position: relative;
    z-index: 1;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    word-break: break-all;
    color: var(--el-text-color-primary);
    line-height: 1.5;
  }

  .result-slip__actions {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
</style>
