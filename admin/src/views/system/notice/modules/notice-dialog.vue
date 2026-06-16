<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增通知公告' : '编辑通知公告'" width="800px"
        align-center @closed="handleClosed">
        <div class="notice-dialog-body">
            <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="12" label-width="90px"
                :show-reset="false" :show-submit="false">
                <template #content>
                    <ArtWangEditor v-model="formData.content" height="360px" />
                </template>
            </ArtForm>
        </div>
        <template #footer>
            <ElButton @click="dialogVisible = false">取消</ElButton>
            <ElButton type="primary" :loading="loading" @click="handleSubmit">提交</ElButton>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
import { useDictStore } from '@/store/modules/dict'
import { fetchCreateNotice, fetchUpdateNotice } from '@/api/system/notice'

interface Props {
    visible: boolean
    type: string
    data?: Partial<Api.SystemNotice.NoticeListItem>
}
interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dictStore = useDictStore()
const { system_notice_type } = dictStore.getDictData(['system_notice_type'])

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
})
const dialogType = computed(() => props.type)
const loading = ref(false)
const formRef = ref()

function getDefaultFormData() {
    return {
        noticeId: undefined as number | undefined,
        title: '',
        noticeType: '',
        content: '',
        status: true,
        sort: 0,
        remark: '',
    }
}

const formData = reactive(getDefaultFormData())

const noticeTypeOptions = computed(() =>
    system_notice_type.value.map((item) => ({
        label: item.dictLabel,
        value: item.dictValue,
    }))
)

const formItems = computed<FormItem[]>(() => [
    {
        label: '公告标题',
        key: 'title',
        type: 'input',
        props: { placeholder: '请输入公告标题' },
    },
    {
        label: '通知类型',
        key: 'noticeType',
        type: 'select',
        props: {
            placeholder: '请选择通知类型',
            options: noticeTypeOptions.value,
        },
    },
    {
        label: '排序',
        key: 'sort',
        type: 'number',
        props: { placeholder: '请输入排序', min: 0, controlsPosition: 'right' },
    },
    {
        label: '状态',
        key: 'status',
        type: 'switch',
    },
    {
        label: '公告内容',
        key: 'content',
        span: 24,
    },
    {
        label: '备注',
        key: 'remark',
        type: 'input',
        span: 24,
        props: { type: 'textarea', rows: 3, placeholder: '请输入备注' },
    },
])

const rules = computed<FormRules>(() => ({
    title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
    noticeType: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
    content: [{
        validator: (_rule, value, callback) => {
            const text = (value || '').replace(/<[^>]+>/g, '').trim()
            if (!text) callback(new Error('请输入公告内容'))
            else callback()
        },
        trigger: 'blur',
    }],
}))

const initFormData = () => {
    loading.value = false
    if (props.type === 'edit' && props.data) {
        Object.assign(formData, {
            noticeId: props.data.noticeId,
            title: props.data.title || '',
            noticeType: props.data.noticeType || '',
            content: props.data.content || '',
            status: props.data.status ?? true,
            sort: props.data.sort ?? 0,
            remark: props.data.remark || '',
        })
    } else {
        Object.assign(formData, getDefaultFormData())
    }
}

watch(
    () => props.visible,
    (visible) => {
        if (visible) nextTick(() => initFormData())
    },
)

const handleSubmit = () => {
    if (!formRef.value) return
    formRef.value.validate().then(async () => {
        try {
            loading.value = true
            if (dialogType.value === 'add') {
                await fetchCreateNotice(formData)
            } else {
                await fetchUpdateNotice(formData)
            }
            emit('submit')
            dialogVisible.value = false
        } catch {
            loading.value = false
        }
    }).catch(() => {
        ElMessage.error('表单校验失败，请检查输入')
    })
}

const handleClosed = () => {
    formRef.value?.reset()
}
</script>

<style scoped lang="scss">
.notice-dialog-body {
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 4px;
}
</style>