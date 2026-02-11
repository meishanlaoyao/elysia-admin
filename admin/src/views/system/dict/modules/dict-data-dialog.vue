<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加字典数据' : '编辑字典数据'" width="500px" align-center
        @closed="handleClosed">
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
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import {
    fetchCreateDictData,
    fetchUpdateDictData,
} from '@/api/system/dict';

type DictDataListItem = Api.SystemDict.DictDataListItem
type DictTypeListItem = Api.SystemDict.DictTypeListItem

interface Props {
    visible: boolean
    type: string
    data?: Partial<DictDataListItem>
    dictTypeList: DictTypeListItem[]
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

const tagTypeOptions = [
    { label: 'Primary', value: 'primary' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Info', value: 'info' },
    { label: 'Danger', value: 'danger' },
]

// 表单实例
const formRef = ref()

// 表单数据
const formData = reactive({
    dictLabel: '',
    dictType: '',
    dictValue: '',
    dictSort: 0,
    remark: '',
    tagType: '',
    customClass: '',
})

// 字典类型选项
const dictTypeOptions = computed(() => {
    return props.dictTypeList.map(item => ({
        label: item.dictName,
        value: item.dictType || ''
    }))
})

// 表单项配置
const formItems = computed<FormItem[]>(() => [
    {
        label: '字典类型',
        key: 'dictType',
        type: 'select',
        props: {
            placeholder: '请选择字典类型',
            options: dictTypeOptions.value
        }
    },
    {
        label: '字典标签',
        key: 'dictLabel',
        type: 'input',
        props: { placeholder: '请输入字典标签' }
    },
    {
        label: '字典值',
        key: 'dictValue',
        type: 'input',
        props: { placeholder: '请输入字典值' }
    },
    {
        label: '标签类型',
        key: 'tagType',
        type: 'select',
        props: {
            placeholder: '请选择标签类型',
            options: tagTypeOptions
        }
    },
    {
        label: '自定义样式',
        key: 'customClass',
        type: 'input',
        props: { placeholder: '请输入自定义class' }
    },
    {
        label: '字典排序',
        key: 'dictSort',
        type: 'number',
        props: { min: 0, controlsPosition: 'right', style: { width: '100%' } }
    },
    {
        label: '备注',
        key: 'remark',
        type: 'input',
        props: { type: 'textarea', rows: 4, placeholder: '请输入备注' }
    }
])

// 表单验证规则
const rules: FormRules = {
    dictLabel: [
        { required: true, message: '请输入字典标签', trigger: 'blur' },
    ],
    dictType: [
        { required: true, message: '请选择字典类型', trigger: 'change' },
    ],
    dictValue: [
        { required: true, message: '请输入字典值', trigger: 'blur' },
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
        dictType: row?.dictType || '',
        dictLabel: isEdit && row ? row.dictLabel || '' : '',
        dictValue: isEdit && row ? row.dictValue || '' : '',
        dictSort: isEdit && row ? row.dictSort || 0 : 0,
        remark: isEdit && row ? row.remark || '' : '',
        tagType: isEdit && row ? row.tagType || '' : '',
        customClass: isEdit && row ? row.customClass || '' : '',
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
                await fetchCreateDictData(formData as DictDataListItem)
            } else {
                await fetchUpdateDictData(formData as DictDataListItem)
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
