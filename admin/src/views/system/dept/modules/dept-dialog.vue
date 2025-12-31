<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加部门' : '编辑部门'" width="500px" align-center>
        <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
            <ElFormItem label="部门名称" prop="deptName">
                <ElInput v-model="formData.deptName" placeholder="请输入部门名称" />
            </ElFormItem>
            <ElFormItem label="父部门" prop="parentId">
                <ElInput v-model="formData.parentId" placeholder="请输入父部门ID" />
            </ElFormItem>
            <ElFormItem label="排序" prop="sort">
                <ElInputNumber v-model="formData.sort" placeholder="请输入排序" />
            </ElFormItem>
            <ElFormItem label="部门状态" prop="status">
                <ElSwitch v-model="formData.status" />
            </ElFormItem>
            <ElFormItem label="备注" prop="remark">
                <ElInput v-model="formData.remark" type="textarea" :rows="4" placeholder="请输入备注" />
            </ElFormItem>
        </ElForm>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="dialogVisible = false">取消</ElButton>
                <ElButton type="primary" @click="handleSubmit">提交</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
    visible: boolean
    type: string,
    data?: Partial<Api.SystemDept.DeptListItem>
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', value: Partial<Api.SystemDept.DeptListItem>): void
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
const formRef = ref<FormInstance>()


// 表单数据
const formData = reactive({
    deptName: '',
    sort: 0,
    status: true,
    remark: '',
    parentId: undefined,
})

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
    const isEdit = props.type === 'edit' && props.data
    const row = props.data || {}
    Object.assign(formData, {
        deptName: isEdit && row.deptName ? row.deptName || '' : '',
        sort: isEdit ? row.sort : 0,
        remark: isEdit && row.remark ? row.remark || '' : '',
        status: isEdit ? row.status : true,
        parentId: row.parentId || undefined,
    })
}

/**
 * 监听对话框状态变化
 * 当对话框打开时初始化表单数据并清除验证状态
 */
watch(
    () => [props.visible, props.type, props.data],
    ([visible]) => {
        if (visible) {
            initFormData()
            nextTick(() => {
                formRef.value?.clearValidate()
            })
        }
    },
    { immediate: true }
)

/**
 * 提交表单
 * 验证通过后触发提交事件
 */
const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
        if (valid) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            emit('submit', formData)
        }
    })
}
</script>

<style scoped lang='scss'></style>