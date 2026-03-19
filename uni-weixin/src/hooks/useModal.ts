import { useModalStore } from '@/store/modal'

/**
 * 显示授权弹窗
 */
export function showAuthModal() {
    const modalStore = useModalStore()
    modalStore.showAuthModal()
}

/**
 * 关闭授权弹窗
 */
export function closeAuthModal() {
    const modalStore = useModalStore()
    modalStore.closeAuthModal()
}