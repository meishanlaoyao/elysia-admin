<template>
    <!-- 登录授权弹窗 -->
    <wd-popup v-model="modelShow" position="bottom" @close="handleClose" :z-index="99999">
        <view class="login-wrap">
            <view class="close-btn" @click="handleClose">
                <wd-icon name="close" size="20px" color="#444"></wd-icon>
            </view>

            <!-- 第三方登录 -->
            <view class="auto-login-box">
                <!-- 微信小程序的快捷登录 -->
                <view v-if="platform.isWechatMiniProgram" class="register-box">
                    <view class="register-title">欢迎使用</view>
                    <view class="register-desc">未注册手机号将自动创建账号</view>
                    <button class="login-btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
                        手机号一键登录
                    </button>
                    <view class="circle" />
                </view>
            </view>

            <!-- 用户协议的勾选 -->
            <view class="agreement-box" :class="{ shake: currentProtocol }">
                <label class="agreement-label">
                    <wd-checkbox v-model="state.protocol" shape="circle" :checked-color="UniColor.primary">
                        <view class="agreement-text">
                            我已阅读并遵守
                            <text class="tcp-text" @tap.stop="navigateToAgreement('user')">《用户协议》</text>
                            与
                            <text class="tcp-text" @tap.stop="navigateToAgreement('privacy')">《隐私协议》</text>
                        </view>
                    </wd-checkbox>
                </label>
            </view>
        </view>
    </wd-popup>
</template>

<script setup lang="ts">
import { UniColor } from '@/utils/color'
import { computed, reactive, ref } from 'vue'
import { useModalStore } from '@/store/modal'
import { useTokenStore } from '@/store/token'
import { closeAuthModal } from '@/hooks/useModal'
import { platform } from '@/utils/platform'
import { getWxCode } from '@/api/login'

const modalStore = useModalStore()
const tokenStore = useTokenStore()

// 授权弹窗显示状态
const modelShow = computed({
    get: () => modalStore.show,
    set: (val) => {
        if (!val) {
            closeAuthModal()
        }
    },
})

const state = reactive({
    protocol: false,
})

const currentProtocol = ref(false)

// 关闭弹窗
function handleClose() {
    closeAuthModal()
}

// 跳转到协议页面
function navigateToAgreement(type: 'user' | 'privacy') {
    const routes = {
        user: '/pages/me/agreement?type=2',
        privacy: '/pages/me/agreement?type=3',
    }
    uni.navigateTo({
        url: routes[type],
    })
}

// 微信小程序的"手机号快速验证"
const getPhoneNumber = async (e: any) => {
    // 检查是否勾选协议
    if (!state.protocol) {
        currentProtocol.value = true
        setTimeout(() => {
            currentProtocol.value = false
        }, 1000)
        uni.showToast({
            title: '请勾选同意',
            icon: 'none',
        })
        return
    }

    // 检查是否获取到手机号授权
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
        uni.showToast({
            title: '快捷登录失败',
            icon: 'none',
        })
        return
    }

    try {
        uni.showLoading({
            title: '登录中...',
            mask: true,
        })

        // 1. 获得微信 code
        const codeResult = await getWxCode()
        if (!codeResult?.code) {
            throw new Error('获取微信登录凭证失败')
        }

        // 2. 一键登录
        await tokenStore.wxmpPhoneLogin(e.detail.code, codeResult.code)

        // 3. 登录成功
        uni.startPullDownRefresh()
        closeAuthModal()
    }
    catch (error: any) {
        console.error('登录失败:', error)
        uni.showToast({
            title: error.message || '登录失败，请重试',
            icon: 'none',
        })
    }
    finally {
        uni.hideLoading()
    }
}
</script>

<style lang="scss" scoped>
.login-wrap {
    width: 750rpx;
    background: #fff;
    border-radius: 32rpx;
    padding: 60rpx 40rpx;
    position: relative;
    box-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
}

.close-btn {
    position: absolute;
    top: 28rpx;
    right: 28rpx;
    cursor: pointer;
}

.auto-login-box {
    margin-bottom: 48rpx;
}

.register-box {
    text-align: center;
    position: relative;
}

.register-title {
    font-size: 36rpx;
    font-weight: 600;
    text-align: center;
    margin-bottom: 16rpx;
}

.register-desc {
    font-size: 26rpx;
    color: #888;
    text-align: center;
    margin-bottom: 48rpx;
}

.login-btn {
    width: 100%;
    height: 88rpx;
    background: $uni-color-primary;
    color: #fff;
    font-size: 32rpx;
    border: none;
    border-radius: 44rpx;
    cursor: pointer;
    line-height: 88rpx;
    padding: 0;
}

.login-btn::after {
    border: none;
}

.login-btn:active {
    opacity: 0.9;
}

.circle {
    display: none;
}

.agreement-box {
    margin-top: 32rpx;
}

.agreement-label {
    display: flex;
    align-items: flex-start;
    font-size: 24rpx;
    color: #666;
    line-height: 1.5;
}

.agreement-text {
    margin-left: 12rpx;
    flex: 1;
}

.tcp-text {
    color: #576b95;
    text-decoration: none;
}

.shake {
    animation: shake 0.5s;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-10rpx);
    }

    75% {
        transform: translateX(10rpx);
    }
}
</style>