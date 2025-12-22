<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加字典数据' : '编辑字典数据'" width="450px" align-center>
        <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
            <ElFormItem label="字典类型" prop="dictType">
                <ElSelect v-model="formData.dictType" placeholder="请选择字典类型">
                    <ElOption v-for="item in dictTypeList" :key="item.dictType" :label="item.dictName"
                        :value="item.dictType || ''" />
                </ElSelect>
            </ElFormItem>
            <ElFormItem label="字典标签" prop="dictLabel">
                <ElInput v-model="formData.dictLabel" placeholder="请输入字典标签" />
            </ElFormItem>
            <ElFormItem label="字典值" prop="dictValue">
                <ElInput v-model="formData.dictValue" placeholder="请输入字典值" />
            </ElFormItem>
            <ElFormItem label="字典排序" prop="dictSort">
                <ElInputNumber v-model="formData.dictSort" placeholder="请输入字典排序" />
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
import {
    fetchGetCacheDictTypeList
} from '@/api/system/dict';
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
    visible: boolean
    type: string
    data?: Partial<Api.SystemDict.DictDataListItem>
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', value: Partial<Api.SystemDict.DictTypeListItem>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dictTypeList = ref<Api.SystemDict.DictTypeListItem[]>([])

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
    dictLabel: '',
    dictType: '',
    dictValue: '',
    dictSort: 0,
})

// 表单验证规则
const rules: FormRules = {
    dictLabel: [
        { required: true, message: '请输入字典标签', trigger: 'blur' },
    ],
    dictType: [
        { required: true, message: '请输入字典类型', trigger: 'blur' },
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
        dictType: isEdit && row ? row.dictType || '' : '',
        dictLabel: isEdit && row ? row.dictLabel || '' : '',
        dictValue: isEdit && row ? row.dictValue || '' : '',
        dictSort: isEdit && row ? row.dictSort || 0 : 0,
    })

    fetchGetCacheDictTypeList().then((res) => {
        dictTypeList.value = res || []
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