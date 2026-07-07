<template>
    <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" @reset="handleReset" @search="handleSearch">
    </ArtSearchBar>
</template>

<script setup lang="ts">
import { useDictStore } from '@/store/modules/dict'

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

const dictStore = useDictStore()
const { api_request_method, system_user_type } = dictStore.getDictData(['api_request_method', 'system_user_type'])

const searchBarRef = ref()
const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const formItems = computed(() => [
    {
        label: '模块',
        key: 'title',
        type: 'input',
        props: { placeholder: '请输入模块', clearable: true },
    },
    {
        label: '操作',
        key: 'action',
        type: 'input',
        props: { placeholder: '请输入操作', clearable: true },
    },
    {
        label: '操作人员',
        key: 'operName',
        type: 'input',
        props: { placeholder: '请输入操作人员', clearable: true },
    },
    {
        label: '操作IP',
        key: 'operIp',
        type: 'input',
        props: { placeholder: '请输入操作IP', clearable: true },
    },
    {
        label: '请求方式',
        key: 'requestMethod',
        type: 'select',
        props: {
            placeholder: '请选择请求方式',
            clearable: true,
            options: api_request_method.value.map((item) => ({
                label: item.dictLabel,
                value: item.dictValue,
            })),
        },
    },
    {
        label: '用户类型',
        key: 'operatorType',
        type: 'select',
        props: {
            placeholder: '请选择用户类型',
            clearable: true,
            options: system_user_type.value.map((item) => ({
                label: item.dictLabel,
                value: item.dictValue,
            })),
        },
    },
    {
        label: '状态',
        key: 'status',
        type: 'select',
        props: {
            placeholder: '请选择状态',
            clearable: true,
            options: [
                { label: '成功', value: true },
                { label: '失败', value: false },
            ],
        },
    },
    {
        label: '操作时间',
        key: 'daterange',
        type: 'datetime',
        props: {
            style: { width: '100%' },
            placeholder: '请选择日期范围',
            type: 'daterange',
            rangeSeparator: '至',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            valueFormat: 'YYYY-MM-DD',
            shortcuts: [
                { text: '今日', value: [new Date(), new Date()] },
                { text: '最近一周', value: [new Date(Date.now() - 604800000), new Date()] },
                { text: '最近一个月', value: [new Date(Date.now() - 2592000000), new Date()] },
            ],
        },
    },
])

function handleReset() {
    emit('reset')
}

async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
}
</script>

<style scoped lang="scss"></style>