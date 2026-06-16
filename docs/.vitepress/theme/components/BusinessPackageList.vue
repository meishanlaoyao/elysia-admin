<script setup lang="ts">
import { computed, reactive } from 'vue'
import { withBase } from 'vitepress'
import { Package } from 'lucide-vue-next'
import { businessPackages, type BusinessPackage } from '../data/business-packages'
import { eaExternalLinkAttrs } from '../shared/linkAttrs'

const props = defineProps<{
  /** 可选：外部传入过滤后的列表，默认读取 businessPackages */
  items?: BusinessPackage[]
}>()

const packages = computed(() => props.items ?? businessPackages)
const coverFailed = reactive<Record<string, boolean>>({})

function coverSrc(cover: string) {
  if (/^https?:\/\//.test(cover)) return cover
  return withBase(cover)
}

function hasCover(pkg: (typeof businessPackages)[number]) {
  return Boolean(pkg.cover) && !coverFailed[pkg.id]
}

function onCoverError(id: string) {
  coverFailed[id] = true
}

function getAuthorInitial(name: string) {
  return (name || '?').charAt(0).toUpperCase()
}
</script>

<template>
  <div v-if="packages.length" class="not-prose ea-bp-grid">
    <div
      v-for="pkg in packages"
      :key="pkg.id"
      class="ea-bp-card group"
    >
      <div class="ea-bp-cover">
        <img
          v-if="hasCover(pkg)"
          :src="coverSrc(pkg.cover)"
          :alt="pkg.name"
          loading="lazy"
          @error="onCoverError(pkg.id)"
        />
        <div v-else class="ea-bp-cover-placeholder">
          <Package
            class="ea-bp-cover-placeholder-icon"
            stroke-width="1.25"
          />
        </div>
        <div v-if="pkg.badge" class="ea-bp-badge-overlay" v-html="pkg.badge" />
      </div>

      <div class="ea-bp-content">
        <div
          v-if="pkg.eaVersions.length"
          class="ea-bp-tags"
        >
          <span
            v-for="ea in pkg.eaVersions"
            :key="ea"
            class="ea-bp-tag"
          >
            <svg
              class="ea-bp-tag-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            EA {{ ea }}
          </span>
        </div>
        <h3 class="ea-bp-title">{{ pkg.name }}</h3>
        <p class="ea-bp-desc">{{ pkg.description }}</p>
        <div class="ea-bp-footer">
          <div class="ea-bp-author">
            <div class="ea-bp-author-avatar">
              {{ getAuthorInitial(pkg.author) }}
            </div>
            <span class="ea-bp-author-name">{{ pkg.author }}</span>
          </div>
          <a
            :href="pkg.url"
            class="ea-bp-btn"
            v-bind="eaExternalLinkAttrs(true)"
          >查看详情</a>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="ea-bp-empty">
    <Package class="ea-bp-empty-icon" stroke-width="1.25" />
    <p class="ea-bp-empty-title">暂无业务包</p>
    <p class="ea-bp-empty-desc">欢迎提交你的第一个业务包</p>
  </div>
</template>

<style scoped>
.ea-bp-grid {
  --ea-bp-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --ea-bp-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --ea-bp-shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.12);
  --ea-bp-transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);

  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  gap: 24px;
  margin: 24px 0;
}

html.dark .ea-bp-grid {
  --ea-bp-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.25);
  --ea-bp-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.35);
  --ea-bp-shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.45);
}

.ea-bp-card {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg);
  box-shadow: var(--ea-bp-shadow-sm);
  transition:
    transform var(--ea-bp-transition),
    box-shadow var(--ea-bp-transition),
    border-color var(--ea-bp-transition);
}

.ea-bp-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--ea-bp-shadow-lg);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 25%, transparent);
}

.ea-bp-cover {
  position: relative;
  height: 168px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-soft) 0%,
    var(--vp-c-bg-soft) 50%,
    var(--vp-c-bg-alt) 100%
  );
}

.ea-bp-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.4s ease;
}

.ea-bp-card:hover .ea-bp-cover img {
  transform: scale(1.04);
}

.ea-bp-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--vp-c-brand-2) 0%, var(--vp-c-brand-3) 100%);
}

.ea-bp-cover-placeholder-icon {
  width: 64px;
  height: 64px;
  color: rgba(255, 255, 255, 0.35);
}

.ea-bp-badge-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.ea-bp-badge-overlay :deep(img) {
  height: 20px;
  width: auto;
  border-radius: 4px;
}

.ea-bp-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px 22px 22px;
}

.ea-bp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.ea-bp-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.ea-bp-tag-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  stroke: currentColor;
}

.ea-bp-title {
  margin: 0 0 8px;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.35;
  color: var(--vp-c-text-1);
}

.ea-bp-desc {
  margin: 0;
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ea-bp-footer {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ea-bp-author {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ea-bp-author-avatar {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, var(--vp-c-brand-2) 100%);
}

.ea-bp-author-name {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ea-bp-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.4;
  color: #fff;
  text-decoration: none;
  background: var(--vp-c-brand-1);
  transition:
    background var(--ea-bp-transition),
    transform 0.15s ease;
}

.ea-bp-btn:hover {
  background: var(--vp-c-brand-2);
}

.ea-bp-btn:active {
  transform: scale(0.97);
}

.ea-bp-empty {
  padding: 80px 24px;
  text-align: center;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 16px;
}

.ea-bp-empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: var(--vp-c-text-3);
  opacity: 0.4;
}

.ea-bp-empty-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.ea-bp-empty-desc {
  margin: 8px 0 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 1024px) {
  .ea-bp-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .ea-bp-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
}
</style>