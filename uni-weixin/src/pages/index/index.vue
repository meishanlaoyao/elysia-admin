<template>
  <view>
    这里是首页
  </view>
</template>

<script lang="ts" setup>
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


onLoad(() => {
  console.log('测试 uni API 自动引入: onLoad')
})
</script>
