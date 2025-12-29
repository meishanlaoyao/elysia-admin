<template>
    <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" @reset="handleReset" @search="handleSearch">
    </ArtSearchBar>
</template>

<script setup lang="ts">
import { useDictStore } from '@/store/modules/dict';
const dictStore = useDictStore()
const { api_request_method } = dictStore.getDictData(['api_request_method'])

interface Props {
    modelValue: Record<string, any>
}
interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单数据双向绑定
const searchBarRef = ref()
const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

// 表单配置
const formItems = computed(() => [
    {
        label: '类型',
        key: 'apiMethod',
        type: 'select',
        placeholder: '请输入接口类型',
        clearable: true,
        options: api_request_method.value.map(item => ({
            label: item.dictLabel,
            value: item.dictValue
        }))
    },
    {
        label: '名称',
        key: 'apiName',
        type: 'input',
        props: { placeholder: '请输入接口名称' },
        clearable: true
    },
    {
        label: '路径',
        key: 'apiPath',
        type: 'input',
        props: { placeholder: '请输入接口路径' },
        clearable: true
    },
])

// 事件
function handleReset() {
    console.log('重置表单')
    emit('reset')
}

async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
    console.log('表单数据', formData.value)
}
</script>

<style scoped lang='scss'></style>