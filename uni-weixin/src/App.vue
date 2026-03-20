<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { navigateToInterceptor } from '@/router/interceptor'
import updateManagerWx from './utils/updateManager.wx'

onLaunch((options) => {
  console.log('App.vue onLaunch', options)
})
onShow((options) => {
  console.log('App.vue onShow', options)
  updateManagerWx()
  // 处理直接进入页面路由的情况：如h5直接输入路由、微信小程序分享后进入等
  // https://github.com/unibest-tech/unibest/issues/192
  if (options?.path) {
    navigateToInterceptor.invoke({ url: `/${options.path}`, query: options.query })
  }
  else {
    navigateToInterceptor.invoke({ url: '/' })
  }
})
onHide(() => { })
</script>

<style lang="scss">
// 调整组件的导航栏
:deep(.wd-navbar__title) {
  font-size: 30rpx !important;
  font-weight: 400 !important;
}

:deep(.wd-navbar__arrow) {
  font-size: 40rpx !important;
  font-weight: 400 !important;
}

// 调整组件的加载组件
:deep(.wd-divider) {
  justify-content: center;
}

:deep(.wd-divider::before) {
  display: none !important;
}

:deep(.wd-divider::after) {
  display: none !important;
}
</style>
