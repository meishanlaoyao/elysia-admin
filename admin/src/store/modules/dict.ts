import { defineStore } from 'pinia'
import { ref, reactive, toRefs } from 'vue'
import { fetchGetDictDataListByType } from '@/api/system/dict'

export const useDictStore = defineStore(
    'dictStore',
    () => {
        /** 字典数据 */
        const dictData = ref<Record<string, Api.SystemDict.DictDataListItem[]>>({})

        /** 正在请求中的字典类型，防止重复请求 */
        const pendingRequests = new Map<string, Promise<Api.SystemDict.DictDataListItem[]>>()

        /**
         * 请求单个字典类型的数据
         * @param dictType 字典类型
         * @returns 字典数据数组
         */
        const fetchDictType = async (dictType: string): Promise<Api.SystemDict.DictDataListItem[]> => {
            if (pendingRequests.has(dictType)) {
                return pendingRequests.get(dictType)!
            }
            const promise = fetchGetDictDataListByType(dictType)
                .then(res => {
                    const data = res || []
                    dictData.value[dictType] = data
                    return data
                })
                .finally(() => {
                    pendingRequests.delete(dictType)
                })
            pendingRequests.set(dictType, promise)
            return promise
        }

        /**
         * 获得字典值（支持解构语法）
         * @param arr 字典类型数组
         * @returns 响应式代理对象，支持解构访问
         * @example
         * const { system_sex_type, system_notice_type } = getDictData(['system_sex_type', 'system_notice_type'])
         */
        const getDictData = (arr: string[]) => {
            const result = reactive<Record<string, Api.SystemDict.DictDataListItem[]>>({})
            arr.forEach(type => {
                if (dictData.value[type]) {
                    result[type] = dictData.value[type]
                } else {
                    result[type] = []
                    fetchDictType(type).then(data => {
                        result[type] = data
                    })
                }
            })
            return toRefs(result)
        }

        return {
            dictData,
            getDictData,
        }
    }
)