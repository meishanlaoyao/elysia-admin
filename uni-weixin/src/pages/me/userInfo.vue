<template>
    <view>
        <wd-navbar fixed placeholder title="用户信息" left-arrow safeAreaInsetTop @click-left="handleClickLeft"></wd-navbar>

        <!-- 头像 -->
        <view class="ss-flex ss-row-center ss-col-center ss-p-t-60 ss-p-b-0 bg-white">
            <view class="header-box-content">
                <image class="content-img" @click="onImgPreview" :src="state.model.avatar" mode="scaleToFill" />
                <view class="avatar-action">
                    <!-- #ifdef MP -->
                    <button class="ss-reset-button avatar-action-btn" open-type="chooseAvatar"
                        @chooseavatar="onChooseAvatar">
                        修改
                    </button>
                    <!-- #endif -->
                    <!-- #ifndef MP -->
                    <button class="ss-reset-button avatar-action-btn" @tap="onChangeAvatar">
                        修改
                    </button>
                    <!-- #endif -->
                </view>
            </view>
        </view>

        <view class="bg-white ss-p-x-30">
            <!-- 昵称 -->
            <wd-cell-group border>
                <wd-cell title="昵称" title-width="200rpx">
                    <input class="nickname-input" type="nickname" placeholder="设置昵称" v-model="state.model.nickname">
                </wd-cell>

                <!-- 性别 -->
                <wd-cell title="性别" title-width="200rpx">
                    <view class="ss-flex ss-col-center">
                        <radio-group @change="onChangeGender" class="ss-flex ss-col-center">
                            <label class="radio" v-for="item in system_user_sex" :key="item.dictValue">
                                <view class="ss-flex ss-col-center ss-m-r-32">
                                    <radio :value="item.dictValue" :color="UniColor.primary"
                                        style="transform: scale(0.8)" :checked="item.dictValue == state.model.sex" />
                                    <view class="gender-name">{{ item.dictLabel }}</view>
                                </view>
                            </label>
                        </radio-group>
                    </view>
                </wd-cell>

                <!-- 手机号 -->
                <wd-cell title="手机号" title-width="200rpx">
                    <view class="ss-flex ss-col-center">
                        <text class="phone-text">{{ state.model.phone || '请绑定手机号' }}</text>
                        <wd-icon v-if="state.model.phoneVerified" name="check-outline" :color="UniColor.primary"
                            size="20px" />
                    </view>
                </wd-cell>
            </wd-cell-group>
        </view>

        <view class="footer ss-p-20">
            <button class="ss-reset-button ui-BG-Color" @tap="onSubmit">保存</button>
            <button class="ss-reset-button gray" @tap="handleLogout">退出登录</button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { useDictStore } from '@/store/dict'
import { UniColor } from '@/utils/color'
import { updateInfo } from '@/api/login'
import { useFileUpload, runOne } from '@/utils/uploadFile'
import { useUserStore } from '@/store/user'
import { useTokenStore } from '@/store/token'

let timer: any = null
const dictStore = useDictStore()
const userStore = useUserStore()
const tokenStore = useTokenStore()

const { system_user_sex } = dictStore.getDictData(['system_user_sex'])

function handleClickLeft() {
    uni.navigateBack()
}

const state = reactive({
    model: {
        avatar: '/static/images/default-avatar.png',
        nickname: '',
        sex: '1',
        phone: '',
        phoneVerified: false
    }
})

// 选择性别
function onChangeGender(e: any) {
    state.model.sex = e.detail.value
}

// 预览图片
function onImgPreview() {
    uni.previewImage({
        urls: [state.model.avatar],
        current: 0
    })
}

// 选择微信的头像
function onChooseAvatar(e: any) {
    const tempUrl = e.detail.avatarUrl || ''
    if (tempUrl) {
        runOne(tempUrl).then(res => {
            state.model.avatar = res
            uni.showToast({ title: '头像上传成功', icon: 'success' })
        }).catch(err => {
            console.error('上传失败', err)
            uni.showToast({ title: '头像上传失败', icon: 'none' })
        })
    }
}

// 手动选择头像
function onChangeAvatar() {
    uni.chooseImage({
        count: 1,
        success: (res) => {
            const tempUrl = res.tempFilePaths[0]
            // 使用 useFileUpload 上传头像
            const { loading, error, data, progress, run } = useFileUpload(
                tempUrl,
                undefined,
                {},
                {
                    maxSize: 5,
                    onProgress: (p) => {
                        console.log(`上传进度：${p}%`)
                    },
                    onSuccess: (res) => {
                        console.log('上传成功', res)
                        state.model.avatar = res.url || res
                        uni.showToast({
                            title: '头像上传成功',
                            icon: 'success'
                        })
                    },
                    onError: (err) => {
                        console.error('上传失败', err)
                        uni.showToast({
                            title: '头像上传失败',
                            icon: 'none'
                        })
                    }
                }
            )
            run()
        }
    })
}

// 保存信息
async function onSubmit() {
    try {
        // 验证必填项
        if (!state.model.nickname) {
            uni.showToast({
                title: '请输入昵称',
                icon: 'none'
            })
            return
        }

        // 调用更新接口
        await updateInfo({
            avatar: state.model.avatar,
            nickname: state.model.nickname,
            sex: state.model.sex
        })

        // 更新本地用户信息
        userStore.setUserInfo({
            ...userStore.userInfo,
            nickname: state.model.nickname,
            sex: state.model.sex,
            avatar: state.model.avatar
        })

        uni.showToast({
            title: '保存成功',
            icon: 'success'
        })
    } catch (error) {
        console.error('保存失败', error)
        uni.showToast({
            title: '保存失败',
            icon: 'none'
        })
    }
}

// 退出登录
async function handleLogout() {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: async (res) => {
            if (res.confirm) {
                await tokenStore.logout()
                uni.showToast({
                    title: '已退出登录',
                    icon: 'success'
                })
                // 跳转到登录页
                timer = setTimeout(() => {
                    uni.reLaunch({
                        url: '/pages/index/index'
                    })
                }, 1500)
            }
        }
    })
}

onLoad(() => {
    const userinfo = userStore.userInfo
    state.model.avatar = userinfo.avatar || ''
    state.model.nickname = userinfo.nickname || ''
    state.model.sex = userinfo.sex || '1'
    state.model.phone = userinfo.phone || ''
})

onUnload(() => {
    clearTimeout(timer)
    timer = null
})

definePage({
    style: {
        navigationStyle: 'custom',
    },
    excludeLoginPath: true
})
</script>

<style scoped lang='scss'>
:deep(.wd-input::after) {
    background: transparent !important;
}

.ss-flex {
    display: flex;
}

.ss-row-center {
    justify-content: center;
}

.ss-col-center {
    align-items: center;
}

.ss-p-t-60 {
    padding-top: 60rpx;
}

.ss-p-b-0 {
    padding-bottom: 0;
}

.ss-p-x-30 {
    padding-left: 30rpx;
    padding-right: 30rpx;
}

.ss-p-20 {
    padding: 20rpx;
}

.ss-m-r-32 {
    margin-right: 32rpx;
}

.bg-white {
    background-color: #fff;
}

.header-box-content {
    position: relative;
    width: 160rpx;
    height: 160rpx;
    overflow: hidden;
    border-radius: 50%;
}

.content-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.avatar-action {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    z-index: 1;
    width: 160rpx;
    height: 46rpx;
    background: rgba(0, 0, 0, 0.3);
}

.avatar-action-btn {
    width: 160rpx;
    height: 46rpx;
    font-weight: 500;
    font-size: 24rpx;
    color: #ffffff;
    background: transparent;
    border: none;
    padding: 0;
    line-height: 46rpx;
}

.ss-reset-button {
    padding: 0;
    margin: 0;
    border: none;
    background: none;

    &::after {
        border: none;
    }
}

.gender-name {
    font-size: 28rpx;
    font-weight: 500;
    line-height: normal;
    color: #333333;
    margin-left: 8rpx;
    white-space: nowrap;
}

.phone-text {
    font-size: 28rpx;
    color: #333333;
    margin-right: 8rpx;
}

.footer {
    width: 100%;
    position: fixed;
    bottom: 100rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    left: 0;
    box-sizing: border-box;

    button {
        width: 45%;
        height: 88rpx;
        line-height: 88rpx;
        text-align: center;
        border-radius: 8rpx;
        font-size: 32rpx;

        &::after {
            border: none;
        }
    }

    .ui-BG-Color {
        background-color: $uni-color-primary !important;
        color: #fff;
    }

    .gray {
        background-color: #e9e9e9;
        color: #333;
    }
}

.nickname-input {

    text-align: left;
}
</style>