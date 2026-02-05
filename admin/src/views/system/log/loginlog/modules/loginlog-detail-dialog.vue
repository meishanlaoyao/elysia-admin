<template>
    <ElDialog v-model="dialogVisible" title="登录日志详情" width="750px" align-center>
        <ElDescriptions :column="2" border label-width="120px">
            <ElDescriptionsItem label="日志ID">
                {{ data?.logId || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="用户ID">
                {{ data?.createBy || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="登录类型">
                {{ data?.loginType || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="登录状态">
                <ElTag :type="data?.status ? 'success' : 'danger'">
                    {{ data?.status ? '成功' : '失败' }}
                </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="客户端类型">
                {{ data?.clientType || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="客户端平台">
                {{ data?.clientPlatform || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="IP地址">
                {{ data?.ipaddr || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="登录地点">
                {{ data?.loginLocation || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作系统" :span="2">
                {{ data?.os || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="User Agent" :span="2">
                <div class="user-agent-text">{{ data?.userAgent || '-' }}</div>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="提示消息" :span="2">
                {{ data?.message || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="登录时间" :span="2">
                {{ data?.createTime ? dayjs(data.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
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

interface Props {
    visible: boolean
    data?: Api.SystemLoginLog.LoginLogListItem
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
</script>

<style scoped lang="scss">
.user-agent-text {
    word-break: break-all;
    white-space: normal;
    line-height: 1.5;
}
</style>
