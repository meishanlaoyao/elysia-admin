<template>
    <ElDialog v-model="dialogVisible" title="操作日志详情" width="750px" align-center>
        <ElDescriptions :column="2" border label-width="90px">
            <ElDescriptionsItem label="日志ID">
                {{ data?.operId || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作人员">
                {{ data?.userId || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="模块">
                {{ data?.title || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作">
                {{ data?.action || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作状态">
                <ElTag :type="data?.status ? 'success' : 'danger'">
                    {{ data?.status ? '成功' : '失败' }}
                </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="请求方式">
                <ElTag :type="dictStore.getTagType('api_request_method', data?.requestMethod)">
                    {{ dictStore.getDictLabel('api_request_method', data?.requestMethod) || '-' }}
                </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作类型">
                {{ data?.operatorType || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作IP">
                {{ data?.operIp || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作地点">
                {{ data?.operLocation || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="请求URL" :span="2">
                <div class="url-text">{{ data?.operUrl || '-' }}</div>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="耗时">
                {{ data?.costTime !== null && data?.costTime !== undefined ? `${data.costTime} ms` : '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作时间">
                {{ data?.createTime ? dayjs(data.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="请求参数" :span="2">
                <div class="json-text">{{ formatJson(data?.operParam) }}</div>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="返回结果" :span="2">
                <div class="json-text">{{ formatJson(data?.jsonResult) }}</div>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="备注" :span="2">
                {{ data?.remark || '-' }}
            </ElDescriptionsItem>
        </ElDescriptions>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="dialogVisible = false">关闭</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ElTag } from 'element-plus'
import { useDictStore } from '@/store/modules/dict';

const dictStore = useDictStore()

interface Props {
    visible: boolean
    data?: Api.SystemOperLog.OperLogListItem
}

interface Emits {
    (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

/**
 * 格式化JSON字符串
 */
const formatJson = (jsonStr: string | null | undefined): string => {
    if (!jsonStr) return '-'
    try {
        const obj = JSON.parse(jsonStr)
        return JSON.stringify(obj, null, 2)
    } catch (e) {
        return jsonStr
    }
}
</script>

<style scoped lang="scss">
.url-text,
.json-text {
    word-break: break-all;
    white-space: pre-wrap;
    line-height: 1.5;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    max-height: 300px;
    overflow-y: auto;
}

.json-text {
    background-color: var(--el-fill-color-light);
    padding: 8px;
    border-radius: 4px;
}
</style>
