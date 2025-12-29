<template>
    <component :is="tagComponent" v-if="dictData" :class="tagClass" :type="tagType">
        {{ dictData.dictLabel }}
    </component>
    <span v-else class="art-dict-tag--empty">{{ emptyText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElTag } from 'element-plus'

interface Props {
    dictList: Api.SystemDict.DictDataListItem[]
    value: string | number | undefined
    emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
    emptyText: '暂无数据'
})

const dictData = computed(() => {
    const value = String(props.value)
    return props.dictList.find(item => item.dictValue === value)
})

const tagComponent = computed(() => {
    if (!dictData.value) return 'span'
    return dictData.value.customClass ? 'span' : dictData.value.tagType ? ElTag : 'span'
})

const tagClass = computed(() => {
    if (!dictData.value) return ''
    return dictData.value.customClass || ''
})

const tagType = computed(() => {
    return dictData.value?.tagType || undefined
})
</script>

<style scoped lang="scss">
.art-dict-tag--empty {
    color: var(--el-text-color-placeholder);
    font-size: 12px;
}
</style>