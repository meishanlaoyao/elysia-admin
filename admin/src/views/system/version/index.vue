<!-- 版本信息页面 -->
<template>
  <div class="version-page art-full-height">
    <div v-loading="loading" class="flex flex-col gap-4 mt-2.5">
      <template v-if="versionInfo">
        <!-- 当前版本 -->
        <div class="art-card version-hero">
          <div class="version-hero__glow"></div>
          <div class="version-hero__inner">
            <div class="min-w-0 flex-1">
              <div class="flex-c flex-wrap gap-2">
                <span class="version-hero__badge">
                  {{ $t('version.current') }}
                </span>
                <ElTag v-if="versionInfo.current.forceUpdate" type="warning" size="small" effect="dark">
                  {{ $t('version.forceUpdate') }}
                </ElTag>
              </div>

              <div class="version-hero__main">
                <span class="version-hero__prefix">v</span>
                <span class="version-hero__number">{{ versionInfo.current.version }}</span>
              </div>

              <p class="version-hero__title">{{ versionInfo.current.title }}</p>

              <div class="version-hero__meta">
                <span class="version-hero__chip">
                  <ArtSvgIcon icon="ri:calendar-line" />
                  {{ versionInfo.current.releaseTime }}
                </span>
                <span class="version-hero__chip">
                  <ArtSvgIcon icon="ri:git-branch-line" />
                  {{ $t('version.totalHistory', { count: versionInfo.history.length }) }}
                </span>
              </div>
            </div>

            <div class="version-hero__emblem">
              <div class="version-hero__emblem-inner">
                <ArtSvgIcon icon="ri:rocket-2-line" />
              </div>
            </div>
          </div>
        </div>

        <!-- 概览指标 -->
        <ElRow :gutter="16" class="version-stats">
          <ElCol v-for="item in stats" :key="item.label" :xs="24" :sm="8">
            <div class="art-card version-stat">
              <div class="version-stat__icon">
                <ArtSvgIcon :icon="item.icon" />
              </div>
              <div class="min-w-0">
                <p class="version-stat__value">{{ item.value }}</p>
                <p class="version-stat__label">{{ item.label }}</p>
              </div>
            </div>
          </ElCol>
        </ElRow>

        <!-- 更新内容 -->
        <div class="art-card p-5">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ $t('version.content') }}</h4>
              <p>{{ versionInfo.current.title }}</p>
            </div>
            <ElTag type="success" size="small" effect="plain">{{ $t('version.latest') }}</ElTag>
          </div>
          <div class="rich-content mt-4" v-html="versionInfo.current.content"></div>
        </div>

        <!-- 历史版本 -->
        <div class="art-card p-5">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ $t('version.history') }}</h4>
              <p>{{ $t('version.totalHistory', { count: versionInfo.history.length }) }}</p>
            </div>
          </div>

          <ElEmpty v-if="!versionInfo.history.length" :description="$t('version.empty')" />
          <ElScrollbar v-else max-height="600px" class="version-timeline">
            <ElTimeline class="!pl-1">
              <ElTimelineItem v-for="(item, index) in versionInfo.history" :key="item.version"
                :timestamp="item.releaseTime" placement="top" :color="index === 0 ? 'var(--theme-color)' : ''">
                <div class="history-item">
                  <div class="history-item__head">
                    <span class="history-item__version">v{{ item.version }}</span>
                    <span class="history-item__title">{{ item.title }}</span>
                    <ElTag v-if="index === 0" type="primary" size="small" effect="plain">
                      {{ $t('version.prevRelease') }}
                    </ElTag>
                    <ElTag v-if="item.forceUpdate" type="warning" size="small" effect="plain">
                      {{ $t('version.forceUpdate') }}
                    </ElTag>
                  </div>
                  <div class="rich-content mt-2.5" v-html="item.content"></div>
                </div>
              </ElTimelineItem>
            </ElTimeline>
          </ElScrollbar>
        </div>
      </template>

      <div v-if="!loading && !versionInfo" class="art-card p-10">
        <ElEmpty :description="$t('version.loadFailed')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { fetchGetVersionInfo } from '@/api/system/version'

defineOptions({ name: 'SystemVersion' })

const { t } = useI18n()

const loading = ref(false)
const versionInfo = ref<Api.SystemVersion.VersionInfo | null>(null)

/**
 * 概览指标（随版本数据变化）
 */
const stats = computed(() => {
  const data = versionInfo.value
  if (!data) return []
  return [
    {
      label: t('version.statCurrent'),
      value: `v${data.current.version}`,
      icon: 'ri:apps-2-line'
    },
    {
      label: t('version.statReleaseDate'),
      value: (data.current.releaseTime || '').split(' ')[0] || '-',
      icon: 'ri:calendar-check-line'
    },
    {
      label: t('version.statHistory'),
      value: String(data.history.length),
      icon: 'ri:git-commit-line'
    }
  ]
})

/**
 * 加载版本信息
 */
const loadVersionInfo = async (): Promise<void> => {
  loading.value = true
  try {
    versionInfo.value = await fetchGetVersionInfo()
  } catch {
    versionInfo.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadVersionInfo()
})
</script>

<style scoped lang="scss">
.version-hero {
  position: relative;
  padding: 26px 28px;
  overflow: hidden;

  &__glow {
    position: absolute;
    top: -70%;
    right: -8%;
    width: 58%;
    height: 240%;
    pointer-events: none;
    content: '';
    background: radial-gradient(circle at 50% 50%, var(--theme-color), transparent 66%);
    border-radius: 50%;
    opacity: 0.18;
  }

  &__inner {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
    color: var(--theme-color);
    background: color-mix(in srgb, var(--theme-color) 12%, transparent);
    border-radius: 999px;
  }

  &__main {
    display: flex;
    align-items: baseline;
    margin-top: 12px;
    line-height: 1.1;
  }

  &__prefix {
    margin-right: 3px;
    font-size: 24px;
    font-weight: 500;
    color: var(--art-gray-500);
  }

  &__number {
    font-size: 44px;
    font-weight: 700;
    color: var(--art-gray-900);
    letter-spacing: -1px;
  }

  &__title {
    margin: 10px 0 0;
    font-size: 15px;
    color: var(--art-gray-700);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  &__chip {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    color: var(--art-gray-600);
    background: var(--art-gray-100);
    border: 1px solid var(--art-card-border);
    border-radius: 6px;
  }

  &__emblem {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    background: color-mix(in srgb, var(--theme-color) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-color) 22%, transparent);
    border-radius: 26px;
  }

  &__emblem-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 66px;
    height: 66px;
    font-size: 32px;
    color: var(--theme-color);
    background: var(--default-box-color);
    border-radius: 20px;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-color) 18%, transparent);
  }
}

.version-stats {
  margin-bottom: -16px;
}

.version-stat {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px 20px;
  margin-bottom: 16px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &__icon {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 20px;
    color: var(--theme-color);
    background: color-mix(in srgb, var(--theme-color) 10%, transparent);
    border-radius: 12px;
  }

  &__value {
    margin: 0;
    overflow: hidden;
    font-size: 18px;
    font-weight: 600;
    color: var(--art-gray-900);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__label {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--art-gray-500);
  }
}

.version-timeline {
  margin-top: 18px;
}

.history-item {
  padding: 14px 16px;
  background: var(--art-gray-100);
  border: 1px solid var(--art-card-border);
  border-radius: calc(var(--custom-radius) / 2 + 4px);
  transition:
    border-color 0.2s,
    background-color 0.2s;

  &:hover {
    background: var(--art-hover-color);
    border-color: color-mix(in srgb, var(--theme-color) 35%, transparent);
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__version {
    font-size: 15px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  &__title {
    font-size: 13px;
    color: var(--art-gray-600);
  }
}

.rich-content {
  font-size: 13px;
  line-height: 1.85;
  color: var(--art-gray-700);
  word-break: break-word;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 10px 0 6px;
    font-weight: 500;
    color: var(--art-gray-800);
  }

  :deep(p) {
    margin: 5px 0;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
    margin: 5px 0;
    list-style: disc;
  }

  :deep(ol) {
    list-style: decimal;
  }

  :deep(li) {
    margin: 3px 0;
  }

  :deep(li::marker) {
    color: var(--theme-color);
  }

  :deep(a) {
    color: var(--theme-color);
  }

  :deep(code) {
    padding: 1px 5px;
    font-size: 12px;
    background: var(--art-gray-200);
    border-radius: 4px;
  }
}

@media (width <=640px) {
  .version-hero {
    padding: 20px;

    &__number {
      font-size: 32px;
    }

    &__prefix {
      font-size: 18px;
    }

    &__emblem {
      display: none;
    }
  }
}
</style>
