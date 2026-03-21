import { http } from '@/http/http'

/**
 * 生成预签名URL
 */
export function generatePreSignUrl(fileName: string) {
    return http.get<string>('/api/system/storage/presign', { fileName })
}