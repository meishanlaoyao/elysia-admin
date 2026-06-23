---
title: 感谢支持 - Elysia Admin
description: 感谢自愿打赏与支持 Elysia Admin 开源项目的朋友们，你们的鼓励是项目持续维护的动力。
head:
  - - meta
    - name: keywords
      content: Elysia Admin 鸣谢, 感谢支持, 打赏, 开源赞助
  - - meta
    - property: og:title
      content: 感谢支持 - Elysia Admin
  - - meta
    - property: og:description
      content: 感谢自愿支持 Elysia Admin 开源项目的朋友们。
---

# 感谢支持

`Elysia Admin` 是开源项目，维护与文档更新离不开社区朋友的鼓励。以下为自愿打赏支持的朋友，排名不分先后，在此一并致谢。

::: info
暂不接受陌生人打赏。如需支持项目，请先 [添加作者微信](/other/social#微信) 后再进行打赏。
:::

<script setup>
const sponsors = [
  { avatar: '/tip/蜗牛先生.jpg', nickname: '蜗牛先生' },
  { avatar: '/tip/夏天.jpg', nickname: '夏天' },
]
</script>

<div v-if="sponsors.length" class="not-prose ea-sponsor-grid my-8">
  <div
    v-for="item in sponsors"
    :key="item.nickname"
    class="ea-sponsor-card"
  >
    <img
      :src="item.avatar"
      :alt="item.nickname"
      class="ea-sponsor-avatar"
      loading="lazy"
    />
    <p class="ea-sponsor-name">{{ item.nickname }}</p>
  </div>
</div>

<p v-else class="text-[14px] text-fg-muted">暂无鸣谢名单。</p>

<style scoped>
.ea-sponsor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .ea-sponsor-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .ea-sponsor-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.ea-sponsor-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
}

.ea-sponsor-avatar {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  object-fit: cover;
  border: 2px solid var(--vp-c-divider);
}

.ea-sponsor-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
</style>