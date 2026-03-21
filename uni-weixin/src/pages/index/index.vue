<template>
  <view class="p-50rpx">
    <wd-text>这里是首页</wd-text>
    <wd-button @click="handleUploadfile">上传文件</wd-button>
    <br>
    <wd-img :src="img" width="600rpx" height="500rpx" />
  </view>
</template>

<script lang="ts" setup>
import { uploadFileToS3 } from '@/utils/uploadFile';

const img = ref('')
async function handleUploadfile() {
  img.value = await uploadFileToS3().image() as string
}

defineOptions({
  name: 'Home',
})
definePage({
  // 使用 type: "home" 属性设置首页，其他页面不需要设置，默认为page
  type: 'home',
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})
</script>