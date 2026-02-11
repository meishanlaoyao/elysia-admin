<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加字典类型' : '编辑字典类型'" width="500px" align-center
        @closed="handleClosed">
        <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="24" label-width="80px"
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
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import {
    fetchCreateDictType,
    fetchUpdateDictType,
} from '@/api/system/dict';

interface Props {
    visible: boolean
    type: string
    data?: Partial<Api.SystemDict.DictTypeListItem>
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

const dialogType = computed(() => props.type)

// 表单实例
const formRef = ref()

// 表单数据
const formData = reactive({
    dictName: '',
    dictType: '',
})

// 表单项配置
const formItems: FormItem[] = [
    {
        label: '字典名称',
        key: 'dictName',
        type: 'input',
        props: { placeholder: '请输入字典名称' }
    },
    {
        label: '字典类型',
        key: 'dictType',
        type: 'input',
        props: { placeholder: '请输入字典类型' }
    }
]

// 表单验证规则
const rules: FormRules = {
    dictName: [
        { required: true, message: '请输入字典名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    dictType: [
        { required: true, message: '请输入字典类型', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ]
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
    const isEdit = props.type === 'edit' && props.data
    const row = props.data
    Object.assign(formData, {
        ...row,
        dictName: isEdit && row ? row.dictName || '' : '',
        dictType: isEdit && row ? row.dictType || '' : '',
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
const handleSubmit = async () => {
    if (!formRef.value) return
    formRef.value.validate().then(async () => {
        try {
            if (dialogType.value == 'add') {
                await fetchCreateDictType(formData)
            } else {
                await fetchUpdateDictType(formData)
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

<style scoped lang='scss'></style>
