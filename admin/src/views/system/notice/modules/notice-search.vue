<template>
    <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" @reset="handleReset" @search="handleSearch" />
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
const { system_notice_type } = dictStore.getDictData(['system_notice_type'])

const searchBarRef = ref()
const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const formItems = computed(() => [
    {
        label: '公告标题',
        key: 'title',
        type: 'input',
        props: { placeholder: '请输入公告标题' },
        clearable: true,
    },
    {
        label: '通知类型',
        key: 'noticeType',
        type: 'select',
        props: {
            placeholder: '请选择通知类型',
            clearable: true,
            options: system_notice_type.value.map((item) => ({
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
                { label: '启用', value: true },
                { label: '停用', value: false },
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
