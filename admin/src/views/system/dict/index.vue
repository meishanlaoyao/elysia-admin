<template>
    <ElRow class="dict-page" :gutter="20">
        <ElCol :span="12">
            <DictTypeManagement :cache-dict-type="cacheDictType" @refresh-cache="getCacheDictTypeList"
                @choose-dict-type="handleChooseDictType" />
        </ElCol>
        <ElCol :span="12">
            <DictDataManagement :cache-dict-type="cacheDictType" :selected-dict-type="selectedDictType" />
        </ElCol>
    </ElRow>
</template>

<script setup lang="ts">
import { fetchGetCacheDictTypeList } from '@/api/system/dict';
import DictTypeManagement from './modules/DictTypeManagement.vue';
import DictDataManagement from './modules/DictDataManagement.vue';

type DictTypeListItem = Api.SystemDict.DictTypeListItem

const cacheDictType = ref<DictTypeListItem[]>([])
const selectedDictType = ref<string>()

function getCacheDictTypeList() {
    fetchGetCacheDictTypeList().then(res => {
        cacheDictType.value = res
    })
}

function handleChooseDictType(dictType: string) {
    selectedDictType.value = dictType
}

onMounted(() => {
    getCacheDictTypeList()
})
</script>

<style scoped lang='scss'>
.dict-page {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
}
</style>