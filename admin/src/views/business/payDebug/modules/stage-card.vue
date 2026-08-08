<template>
  <div class="stage-card" :class="[`is-${state}`, { 'is-enter': true }]" :style="{ '--i': index }">
    <div class="stage-card__inner">
      <div class="stage-card__head">
        <div class="stage-card__badge">
          <ArtSvgIcon v-if="state === 'done'" icon="ri:check-line" class="stage-card__check" />
          <span v-else>{{ step }}</span>
        </div>
        <div class="stage-card__titles">
          <h3 class="stage-card__title">{{ title }}</h3>
          <p v-if="desc" class="stage-card__desc">{{ desc }}</p>
        </div>
        <span class="stage-card__status" :data-state="state">{{ statusLabel }}</span>
      </div>
      <div class="stage-card__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PayDebugStageCard' })

type StageState = 'todo' | 'active' | 'done'

const props = withDefaults(
  defineProps<{
    step: number
    title: string
    desc?: string
    state?: StageState
    index?: number
  }>(),
  {
    state: 'todo',
    index: 0
  }
)

const statusLabel = computed(() => {
  if (props.state === 'done') return '已完成'
  if (props.state === 'active') return '进行中'
  return '待执行'
})
</script>

<style scoped lang="scss">
.stage-card {
  --stage-radius: calc(var(--custom-radius) + 4px);
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  border-radius: var(--stage-radius);
  animation: stage-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: calc(var(--i, 0) * 70ms);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    background: color-mix(in srgb, var(--el-text-color-primary) 14%, var(--art-card-border));
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    transition: background 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
  }

  &.is-active::before {
    padding: 2px;
    background: linear-gradient(135deg,
        var(--el-color-primary),
        var(--el-color-primary-light-3) 55%,
        color-mix(in srgb, var(--el-color-primary) 55%, transparent));
  }

  &.is-done::before {
    padding: 2px;
    background: linear-gradient(135deg,
        var(--el-color-success),
        var(--el-color-success-light-3) 55%,
        color-mix(in srgb, var(--el-color-success) 55%, transparent));
  }
}

.stage-card__inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  border-radius: inherit;
  background: var(--default-box-color);
  overflow: hidden;
}

.stage-card__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--art-card-border);
  flex-shrink: 0;
}

.stage-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  flex-shrink: 0;
  transition:
    background 0.3s ease,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.is-done .stage-card__badge {
  background: linear-gradient(135deg, var(--el-color-success), var(--el-color-success-light-3));
  transform: scale(1.05);
}

.is-todo .stage-card__badge {
  background: linear-gradient(135deg, var(--art-gray-400), var(--art-gray-500));
  opacity: 0.7;
}

.stage-card__check {
  font-size: 16px;
}

.stage-card__titles {
  flex: 1;
  min-width: 0;
}

.stage-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.35;
}

.stage-card__desc {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--el-text-color-secondary);
}

.stage-card__status {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.6;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  transition: all 0.25s ease;

  &[data-state='active'] {
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    color: var(--el-color-primary);
  }

  &[data-state='done'] {
    background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
    color: var(--el-color-success);
  }
}

.stage-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 14px 16px 16px;
  overflow: hidden;
}

@keyframes stage-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage-card {
    animation: none;
  }
}
</style>
