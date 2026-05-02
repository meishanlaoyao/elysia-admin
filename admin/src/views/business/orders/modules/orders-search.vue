<template>
    <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" @reset="handleReset" @search="handleSearch">
    </ArtSearchBar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
const { system_orders_status, system_pay_method } = dictStore.getDictData(['system_orders_status', 'system_pay_method'])

// 表单数据双向绑定
const searchBarRef = ref()
const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

// 表单配置
const formItems = computed(() => [
    {
        label: '订单号',
        key: 'orderNo',
        type: 'input',
        props: { placeholder: '请输入订单号', clearable: true },
    },
    // {
    //     label: '支付方式',
    //     key: 'paymentMethod',
    //     type: 'select',
    //     props: {
    //         placeholder: '请选择支付方式',
    //         clearable: true,
    //         options: system_pay_method.value?.map(item => ({
    //             label: item.dictLabel,
    //             value: item.dictValue
    //         })) || []
    //     },
    // },
    {
        label: '状态',
        key: 'status',
        type: 'select',
        props: {
            placeholder: '请选择状态',
            clearable: true,
            options: system_orders_status.value?.map(item => ({
                label: item.dictLabel,
                value: item.dictValue
            })) || []
        },
    },
    {
        label: '创建日期',
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
                { text: '最近一个月', value: [new Date(Date.now() - 2592000000), new Date()] }
            ]
        }
    }
])

// 事件
function handleReset() {
    emit('reset')
}

async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
}
</script>

<style scoped lang='scss'></style>
