<template>
  <s-layout :options="{
    navabarMode: 'custom',
    title: '',
    backgroundColor: '#ffffff',
    customNavbar: {
      gradientColors: 'linear-gradient(to right, #067fd7, #47cbfc)',
      backgroundHeight: '647rpx',
    },
  }">
    <view class="user-info">
      <view class="base-info" @click="GoToPage('/pages/me/userInfo')">
        <view class="avatar-box">
          <wd-img width="129rpx" height="129rpx" :src="userInfo.avatar" />
        </view>
        <view class="text-box">
          <template v-if="isLogin">
            <view class="nickname">{{ userInfo.nickname }}</view>
            <view class="phone">{{ maskPhone }}</view>
          </template>
          <template v-else>
            <view class="nickname">请先登录</view>
          </template>
        </view>
      </view>
      <wd-img width="35rpx" height="35rpx" @click="GoToPage('/pages/me/userInfo')" v-if="isLogin"
        :src="GetCosImg('/uni/me/user-edit-btn.png')" mode="aspectFill" />
    </view>
    <view class="menu-box">

      <view class="menu-box-item" v-for="item in menus" :key="item.path" @click="GoToPage(item.path)">
        <view class="left-info">
          <view class="icon-box">
            <wd-img :width="item.icon.width" :height="item.icon.height" :src="item.icon.src" />
          </view>
          <text>{{ item.title }}</text>
        </view>
        <wd-icon name="arrow-right" size="38rpx" color="#aaa"></wd-icon>
      </view>
    </view>
  </s-layout>
</template>

<script lang="ts" setup>
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

const tokenStore = useTokenStore()
const userStore = useUserStore()
const isLogin = computed(() => tokenStore.hasLogin)
const userInfo = computed(() => userStore.userInfo)

const menus = [
  { title: '用户协议', path: '/pages/me/agreement?type=2', icon: { width: '48rpx', height: '48rpx', src: '/static/images/me/m1.png' } },
  { title: '隐私协议', path: '/pages/me/agreement?type=3', icon: { width: '48rpx', height: '48rpx', src: '/static/images/me/m2.png' } }
];

// 脱敏手机号
const maskPhone = computed(() => {
  let phone = userInfo.value.phone
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

onLoad(() => {
  userStore.fetchUserInfo()
})

definePage({
  style: {
    navigationStyle: 'custom',
  },
  excludeLoginPath: false,
})
</script>

<style scoped lang="scss">
.user-info {
  padding-top: 37rpx;
  margin-left: 40rpx;
  width: 670rpx;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;

  .base-info {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    .avatar-box {
      width: 129rpx;
      height: 129rpx;
      border: 1rpx solid #ffffff;
      border-radius: 50%;
      overflow: hidden;
    }

    .text-box {
      padding-left: 25rpx;
      font-family: Microsoft YaHei;
      font-weight: 400;
      color: #000;

      .nickname {
        font-size: 30rpx;
      }

      .phone {
        margin-top: 20rpx;
        font-size: 24rpx;
      }
    }
  }
}

.menu-box {
  margin-top: 70rpx;
  padding: 80rpx 35rpx;
  background-color: #fff;
  border-radius: 60rpx 60rpx 0 0;

  .menu-box-item {
    margin-bottom: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    flex-flow: row nowrap;
    justify-content: space-between;

    .left-info {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;

      .icon-box {
        width: 77rpx;
      }

      text {
        font-family: Microsoft YaHei;
        font-weight: 400;
        font-size: 28rpx;
        color: #171818;
      }
    }
  }
}
</style>