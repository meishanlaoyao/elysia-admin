import { http } from '@/http/http'
import type { FindDictDataDto } from './types/Idict'

/**
 * 查询所有-缓存数据
 */
export async function findAllData(dictType: string) {
    return await http.get<FindDictDataDto[]>('/system/dict/data/all', { dictType })
}