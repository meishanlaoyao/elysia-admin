<template>
  <div class="page-content !border-0 !bg-transparent min-h-screen flex-cc">
    <div class="flex-cc max-md:!block max-md:text-center">
      <ThemeSvg :src="data.imgUrl" size="100%" class="!w-100" />
      <div class="ml-15 w-75 max-md:mx-auto max-md:mt-10 max-md:w-full max-md:text-center">
        <p class="text-xl leading-7 text-g-600 max-md:text-lg">{{ data.desc }}</p>
        <ElButton type="primary" size="large" @click="backHome" v-ripple class="mt-5">
          {{actionBtnText}}
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCommon } from '@/hooks/core/useCommon'
  import { getRouteInitFailed } from '@/router/guards/beforeEach'
  import { useUserStore } from '@/store/modules/user'

  const router = useRouter()
  const { t } = useI18n()
  const userStore = useUserStore()

  interface ExceptionData {
    /** 标题 */
    title: string
    /** 描述 */
    desc: string
    /** 按钮文本 */
    btnText: string
    /** 图片地址 */
    imgUrl: string
  }

  const props = withDefaults(
    defineProps<{
      data: ExceptionData
    }>(),
    {}
  )

  const { homePath } = useCommon()

  const actionBtnText = computed(() =>
    getRouteInitFailed() ? t('exceptionPage.relogin') : props.data.btnText
  )

  const backHome = async () => {
    if (getRouteInitFailed()) {
      await userStore.logOut()
      return
    }
    router.push(homePath.value)
  }
</script>
