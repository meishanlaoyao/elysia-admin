<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加接口' : '编辑接口'" width="500px" align-center>
        <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
            <ElFormItem label="接口名称" prop="apiName">
                <ElInput v-model="formData.apiName" placeholder="请输入接口名称" />
            </ElFormItem>
            <ElFormItem label="接口路径" prop="apiPath">
                <ElInput v-model="formData.apiPath" placeholder="请输入接口路径" />
            </ElFormItem>
            <ElFormItem label="接口方法" prop="apiMethod">
                <ElSelect v-model="formData.apiMethod" placeholder="请选择接口方法">
                    <ElOption v-for="item in api_request_method" :key="item.dictValue" :label="item.dictLabel"
                        :value="item.dictValue || ''" />
                </ElSelect>
            </ElFormItem>
            <ElFormItem label="状态" prop="status">
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
    data?: Partial<Api.SystemApi.ApiListItem>
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', value: Partial<Api.SystemApi.ApiListItem>): void
}

import { useDictStore } from '@/store/modules/dict';
const dictStore = useDictStore()
const { api_request_method } = dictStore.getDictData(['api_request_method'])

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
    apiName: '',
    apiPath: '',
    apiMethod: '',
    remark: '',
    status: true
})

// 表单验证规则
const rules: FormRules = {
    apiName: [
        { required: true, message: '请输入接口名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    apiPath: [
        { required: true, message: '请输入接口路径', trigger: 'blur' },
    ],
    apiMethod: [
        { required: true, message: '请输入接口方法', trigger: 'blur' }
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
        apiName: isEdit && row.apiName ? row.apiName || '' : '',
        apiPath: isEdit && row.apiPath ? row.apiPath || '' : '',
        apiMethod: isEdit && row.apiMethod ? row.apiMethod || '' : '',
        remark: isEdit && row.remark ? row.remark || '' : '',
        status: isEdit ? row.status : true
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