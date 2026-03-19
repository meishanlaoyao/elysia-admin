import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 模态框 Store
 * 用于管理全局模态框的显示状态
 */
export const useModalStore = defineStore(
    'modal',
    () => {
        // 授权弹窗显示状态
        const show = ref(false)

        // 显示授权弹窗
        const showAuthModal = () => {
            show.value = true
        }

        // 关闭授权弹窗
        const closeAuthModal = () => {
            show.value = false
        }

        return {
            show,
            showAuthModal,
            closeAuthModal,
        }
    },
)
