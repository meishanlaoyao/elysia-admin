<template>
    <ElDialog v-model="dialogVisible" :title="title" width="600px" align-center @closed="handleClosed">
        <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="24" label-width="100px"
            :show-reset="false" :show-submit="false" />
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="dialogVisible = false">取消</ElButton>
                <ElButton type="primary" @click="handleSubmit">提交</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import { fetchCreateJob, fetchUpdateJob } from '@/api/monitor/job'
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'

type JobListItem = Api.MonitorJob.JobListItem

interface Props {
    visible: boolean
    type: string
    data?: Partial<JobListItem>
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

const title = computed(() => (props.type === 'add' ? '新增定时任务' : '编辑定时任务'))

// 表单实例
const formRef = ref()

// 表单数据
const formData = reactive({
    jobName: '',
    jobCron: '',
    jobArgs: '',
    status: true,
    remark: ''
})

// 表单项配置
const formItems = computed<FormItem[]>(() => [
    {
        label: '任务名称',
        key: 'jobName',
        type: 'input',
        props: { placeholder: '请输入任务名称' }
    },
    {
        label: 'Cron表达式',
        key: 'jobCron',
        type: 'input',
        props: { placeholder: '请输入Cron表达式，如：0 0 * * * ?' }
    },
    {
        label: '任务参数',
        key: 'jobArgs',
        type: 'input',
        props: { type: 'textarea', rows: 3, placeholder: '请输入任务参数，如：["param1", "param2"]' }
    },
    {
        label: '状态',
        key: 'status',
        type: 'switch'
    },
    {
        label: '备注',
        key: 'remark',
        type: 'input',
        props: { type: 'textarea', rows: 3, placeholder: '请输入备注' }
    }
])

// 表单验证规则
const rules: FormRules = {
    jobName: [
        { required: true, message: '请输入任务名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    jobCron: [
        { required: true, message: '请输入Cron表达式', trigger: 'blur' }
    ],
    jobArgs: [
        { required: true, message: '请输入任务参数', trigger: 'blur' }
    ]
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
    const isEdit = props.type === 'edit' && props.data
    const row = props.data || {}
    Object.assign(formData, {
        ...row,
        jobName: isEdit && row.jobName ? row.jobName || '' : '',
        jobCron: isEdit && row.jobCron ? row.jobCron || '' : '',
        jobArgs: isEdit && row.jobArgs ? row.jobArgs || '' : '',
        remark: isEdit && row.remark ? row.remark || '' : '',
        status: isEdit ? row.status : true
    })
}

/**
 * 监听对话框状态变化
 * 当对话框打开时初始化表单数据
 */
watch(
    () => props.visible,
    (visible) => {
        if (visible) {
            nextTick(() => {
                initFormData()
            })
        }
    }
)

/**
 * 提交表单
 * 验证通过后触发提交事件
 */
const handleSubmit = () => {
    if (!formRef.value) return
    formRef.value.validate().then(async () => {
        try {
            if (props.type === 'add') {
                await fetchCreateJob(formData as JobListItem)
            } else {
                await fetchUpdateJob(formData as JobListItem)
            }
            emit('submit')
            dialogVisible.value = false
        } catch { }
    }).catch(() => {
        ElMessage.error('表单校验失败，请检查输入')
    })
}

/**
 * 对话框关闭后的回调
 */
const handleClosed = () => {
    formRef.value?.reset()
}
</script>
