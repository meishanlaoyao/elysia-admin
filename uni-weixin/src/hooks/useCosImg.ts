import { computed } from 'vue'

/** cos图片基础地址 */
const BASE_COS_URL = '';

/**
 * 获取cos图片地址
 * @param url cos图片地址
 * @returns cos图片地址
 */
export const GetCosImg = computed(() => (url: string) => BASE_COS_URL + url)