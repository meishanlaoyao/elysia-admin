<template>
    <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" @reset="handleReset" @search="handleSearch">
    </ArtSearchBar>
</template>

<script setup lang="ts">
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
        label: '存储名称',
        key: 'name',
        type: 'input',
        props: { placeholder: '请输入存储名称' },
        clearable: true
    }
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
