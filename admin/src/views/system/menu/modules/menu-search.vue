<template>
    <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" :showExpand="false" @reset="handleReset"
        @search="handleSearch">
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
        label: '菜单名称',
        key: 'title',
        type: 'input',
        props: { placeholder: '请输入菜单名称', clearable: true }
    },
    {
        label: '路由地址',
        key: 'path',
        type: 'input',
        props: { placeholder: '请输入路由地址', clearable: true }
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
