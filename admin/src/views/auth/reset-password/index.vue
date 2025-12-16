<template>
    <div class="flex w-full h-screen">
        <LoginLeftView />

        <div class="relative flex-1">
            <AuthTopBar />

            <div class="auth-right-wrap">
                <div class="form">
                    <h3 class="title">{{ $t('resetPassword.title') }}</h3>
                    <p class="sub-title">{{ $t('resetPassword.subTitle') }}</p>

                    <ElForm ref="formRef" :model="formData" :rules="rules" @keyup.enter="handleSubmit"
                        style="margin-top: 25px">
                        <ElFormItem prop="password">
                            <span class="input-label" v-if="showInputLabel">{{ $t('resetPassword.placeholder.password')
                                }}</span>
                            <ElInput class="custom-height" :placeholder="$t('resetPassword.placeholder.password')"
                                v-model.trim="formData.password" type="password" autocomplete="off" show-password />
                        </ElFormItem>

                        <ElFormItem prop="confirmPassword">
                            <span class="input-label" v-if="showInputLabel">{{
                                $t('resetPassword.placeholder.confirmPassword') }}</span>
                            <ElInput class="custom-height"
                                :placeholder="$t('resetPassword.placeholder.confirmPassword')"
                                v-model.trim="formData.confirmPassword" type="password" autocomplete="off"
                                show-password />
                        </ElFormItem>

                        <div style="margin-top: 30px">
                            <ElButton class="w-full custom-height" type="primary" @click="handleSubmit"
                                :loading="loading" v-ripple>
                                {{ $t('resetPassword.submitBtnText') }}
                            </ElButton>
                        </div>

                        <div style="margin-top: 15px">
                            <ElButton class="w-full custom-height" plain @click="toLogin">
                                {{ $t('resetPassword.backBtnText') }}
                            </ElButton>
                        </div>
                    </ElForm>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { fetchResetPassword } from '@/api/auth'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'ResetPassword' })

let timer: any = null
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const showInputLabel = ref(false)
const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
    password: '',
    confirmPassword: ''
})

// 验证确认密码
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
    if (!value) {
        callback(new Error(t('resetPassword.rule.confirmPasswordRequired')))
    } else if (value !== formData.password) {
        callback(new Error(t('resetPassword.rule.passwordMismatch')))
    } else {
        callback()
    }
}

const rules = computed<FormRules>(() => ({
    password: [
        { required: true, message: t('resetPassword.rule.passwordRequired'), trigger: 'blur' },
        { min: 6, message: t('resetPassword.rule.passwordLength'), trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, validator: validateConfirmPassword, trigger: 'blur' }
    ]
}))

// 提交重置密码
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        // 表单验证
        const valid = await formRef.value.validate()
        if (!valid) return

        // 获取 token
        const token = route.query.token as string
        if (!token) {
            ElMessage.error(t('resetPassword.tokenInvalid'))
            return
        }
        // 获取 uid
        const uid = route.query.uid as string
        if (!uid) {
            ElMessage.error(t('resetPassword.uidInvalid'))
            return
        }
        loading.value = true
        await fetchResetPassword({
            token,
            uid: Number(uid),
            password: formData.password
        })
        timer = setTimeout(() => {
            router.push({ name: 'Login' })
        }, 1500)
    } catch (error) {
        console.error('[ResetPassword] Error:', error)
    } finally {
        loading.value = false
    }
}

// 返回登录
const toLogin = () => {
    router.push({ name: 'Login' })
}

// 组件销毁时清除定时器
onBeforeUnmount(() => {
    if (timer) {
        clearTimeout(timer)
    }
})
</script>

<style scoped>
@import '../login/style.css';
</style>
