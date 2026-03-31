<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加部门' : '编辑部门'" width="450px" align-center
        @closed="handleClosed">
        <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="24" label-width="80px"
            :show-reset="false" :show-submit="false" />
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="dialogVisible = false">取消</ElButton>
                <ElButton type="primary" :loading="loading" @click="handleSubmit">提交</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import { fetchCreateDept, fetchUpdateDept } from '@/api/system/dept'

interface Props {
    visible: boolean
    type: string,
    data?: Partial<Api.SystemDept.DeptListItem>
    deptOptions?: Api.SystemDept.DeptListItem[]
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
const loading = ref(false)

const dialogType = computed(() => props.type)

// 表单实例
const formRef = ref()

// 表单数据
const formData = reactive({
    deptName: '',
    sort: 0,
    status: true,
    remark: '',
    parentId: undefined,
})

// 级联选择器配置
const cascaderProps = {
    value: 'deptId',
    label: 'deptName',
    children: 'children',
    checkStrictly: true,
    emitPath: false
}

// 表单项配置
const formItems = computed<FormItem[]>(() => [
    {
        label: '部门名称',
        key: 'deptName',
        type: 'input',
        props: { placeholder: '请输入部门名称' }
    },
    {
        label: '父部门',
        key: 'parentId',
        type: 'cascader',
        props: {
            options: props.deptOptions || [],
            props: cascaderProps,
            placeholder: '请选择父部门',
            clearable: true,
            showAllLevels: false,
            style: { width: '100%' }
        }
    },
    {
        label: '排序',
        key: 'sort',
        type: 'number',
        props: { placeholder: '请输入排序', controlsPosition: 'right', style: { width: '100%' }, min: 0 }
    },
    {
        label: '部门状态',
        key: 'status',
        type: 'switch'
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
    deptName: [
        { required: true, message: '请输入部门名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
    loading.value = false
    const isEdit = props.type === 'edit' && props.data
    const row = props.data || {}
    Object.assign(formData, {
        ...row,
        deptName: isEdit && row.deptName ? row.deptName || '' : '',
        sort: isEdit ? row.sort : 0,
        remark: isEdit && row.remark ? row.remark || '' : '',
        status: isEdit ? row.status : true,
        parentId: row.parentId || undefined,
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
            loading.value = true
            if (dialogType.value == 'add') {
                await fetchCreateDept(formData)
            } else {
                await fetchUpdateDept(formData)
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

/**
 * 对话框关闭后的回调
 */
const handleClosed = () => {
    formRef.value?.reset()
}
</script>

<style scoped lang='scss'></style>
