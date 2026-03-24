<template>
  <view class="s-layout" :style="{ backgroundColor: mergedOptions.backgroundColor }">
    <!-- 传统导航栏 -->
    <wd-navbar v-if="mergedOptions.navabarMode === 'base'" :title="mergedOptions.title"
      :left-arrow="mergedOptions.showBack" placeholder safe-area-inset-top fixed @click-left="handleClickLeft" />

    <!-- 自定义导航栏 + 滚动后渐显的传统导航栏 -->
    <template v-else-if="mergedOptions.navabarMode === 'custom'">
      <!-- 自定义导航栏 -->
      <view class="custom-navbar-block">
        <wd-gap :height="`${headBtn.top}px`" />

        <!-- 返回按钮 -->
        <view v-if="mergedOptions.showBack" class="custom-back-btn" :style="{
          top: `${headBtn.top}px`,
          height: `${headBtn.height}px`,
        }" @click="handleClickLeft">
          <wd-img width="18rpx" height="31rpx" :src="GetCosImg('/uni/basic/back-black.png')" />
        </view>

        <!-- 标题 -->
        <view class="custom-title" :style="{
          height: `${headBtn.height}px`,
          lineHeight: `${headBtn.height}px`,
          color: mergedOptions.customNavbar?.color ?? '#fff',
        }">
          {{ mergedOptions.title || '' }}
        </view>

        <!-- 背景 -->
        <view class="custom-bg" :style="customNavbarStyle" />
      </view>

      <!-- 滚动后渐显的传统导航栏（始终挂载，避免闪烁） -->
      <view v-if="enableScrollSwitch" class="scroll-navbar-wrap" :style="{
        opacity: scrollNavbarOpacity,
        pointerEvents: isBaseNavbarVisible ? 'auto' : 'none',
      }">
        <wd-navbar :title="mergedOptions.title" :left-arrow="mergedOptions.showBack" placeholder safe-area-inset-top
          fixed @click-left="handleClickLeft" />
      </view>
    </template>

    <slot name="custom" :headBtn="headBtn"></slot>

    <!-- 内容 -->
    <view class="s-layout-content">
      <slot :headBtn="headBtn" />
    </view>

    <!-- 认证弹窗 -->
    <sAuthModal />
  </view>
</template>

<script setup lang="ts">
import { GetCosImg } from '@/hooks/useCosImg'
import sAuthModal from '../s-auth-modal/s-auth-modal.vue'

interface IOptions {
  /**
   * 导航栏模式 base传统导航栏 | custom自定义导航栏
   */
  navabarMode?: 'base' | 'custom'
  /**
   * 导航栏标题
   */
  title?: string
  /**
   * 是否显示返回按钮 navabarMode=base时有效
   */
  showBack?: boolean
  /**
   * 自定义导航栏
   */
  customNavbar?: {
    /** 背景图片 */
    backgroundImage?: string
    /** 渐变颜色背景导航栏 */
    gradientColors?: string
    /** 背景高度 */
    backgroundHeight?: string
    /** 文字颜色 */
    color?: string
    /** 是否启用滚动后切换为传统导航栏 */
    enableScrollSwitch?: boolean
    /** 滚动多少距离后切换，单位 px */
    scrollSwitchDistance?: number
    /** 滞后区间 px，防止阈值附近闪烁，默认 30 */
    scrollSwitchHysteresis?: number
  } | null
  /**
   * 背景色
   */
  backgroundColor?: string
  /**
   * 页面滚动距离（由页面 onPageScroll 传入）
   */
  scrollTop?: number
}

const props = defineProps<{
  options?: IOptions
}>()
const emit = defineEmits<{
  /** 初始化菜单按钮信息 */
  (e: 'initMenuBtnInfo', val: UniApp.GetMenuButtonBoundingClientRectRes): void
}>()

const headBtn = ref<UniApp.GetMenuButtonBoundingClientRectRes>({
  top: 0,
  height: 0,
  width: 0,
  right: 0,
  bottom: 0,
  left: 0,
})

const mergedOptions = computed(() => ({
  navabarMode: props.options?.navabarMode ?? 'base',
  title: props.options?.title ?? '',
  showBack: props.options?.showBack ?? false,
  customNavbar: props.options?.customNavbar ?? null,
  backgroundColor: props.options?.backgroundColor ?? '#f5f5f5',
  scrollTop: props.options?.scrollTop ?? 0,
}))

const enableScrollSwitch = computed(() => {
  return props.options?.navabarMode === 'custom'
    && (props.options?.customNavbar?.enableScrollSwitch ?? false)
})

const isBaseNavbarVisible = ref(false)
const scrollNavbarOpacity = computed(() => (isBaseNavbarVisible.value ? 1 : 0))

watch(
  [() => props.options?.scrollTop ?? 0, enableScrollSwitch],
  ([scrollTop, enabled]) => {
    if (!enabled) {
      isBaseNavbarVisible.value = false
      return
    }
    const distance = props.options?.customNavbar?.scrollSwitchDistance ?? 0
    const hysteresis = props.options?.customNavbar?.scrollSwitchHysteresis ?? 30
    if ((scrollTop as number) >= distance) {
      isBaseNavbarVisible.value = true
    }
    else if ((scrollTop as number) < distance - hysteresis) {
      isBaseNavbarVisible.value = false
    }
  },
  { immediate: true },
)

const customNavbarStyle = computed(() => {
  if (!mergedOptions.value.customNavbar)
    return {}
  if (mergedOptions.value.customNavbar.backgroundImage) {
    // 背景图片
    return {
      height: mergedOptions.value.customNavbar?.backgroundHeight ?? '0rpx',
      background: `url(${mergedOptions.value.customNavbar?.backgroundImage}) no-repeat left top`,
      backgroundPosition: 'left top',
      backgroundSize: `100% ${mergedOptions.value.customNavbar?.backgroundHeight ?? '0rpx'}`,
    }
  }
  else {
    // 颜色背景
    return {
      height: mergedOptions.value.customNavbar?.backgroundHeight ?? '0rpx',
      background: mergedOptions.value.customNavbar?.gradientColors ?? '',
    }
  }
})

function handleClickLeft() {
  if (!mergedOptions.value.showBack)
    return
  uni.navigateBack()
}

onMounted(() => {
  headBtn.value = uni.getMenuButtonBoundingClientRect()
  console.log("胶囊菜单信息", headBtn.value)
  // emit('initMenuBtnInfo', headBtn.value)
})
</script>

<style scoped lang='scss'>
.s-layout {
  width: 100%;
  // min-height: 100vh;

  .scroll-navbar-wrap {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    transition: opacity 0.25s ease;
  }

  .custom-back-btn {
    position: absolute;
    left: 40rpx;
    display: flex;
    align-items: center;
    z-index: 2;
  }

  .custom-title {
    position: relative;
    width: 100%;
    text-align: center;
    font-family: Microsoft YaHei;
    font-weight: 400;
    font-size: 30rpx;
    z-index: 1;
  }

  .custom-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 0;
  }

  .s-layout-content {
    position: relative;
    z-index: 1;
  }
}
</style>