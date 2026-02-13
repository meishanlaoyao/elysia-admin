<template>
    <div class="upload-test-page p-6">
        <ElCard header="文件上传测试">
            <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="12"
                @submit="handleSubmit" />

            <ElDivider />

            <div class="result-display">
                <h3>表单数据预览：</h3>
                <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
            </div>
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import ArtForm from '@/components/core/forms/art-form/index.vue'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import type { FormRules } from 'element-plus'

const formRef = ref()

// 表单数据
const formData = ref({
    title: '',
    avatar: '', // 单文件 - 字符串
    images: [], // 多文件 - 字符串数组
    documents: [] // 多文件 - 字符串数组
})

// 表单配置
const formItems: FormItem[] = [
    {
        label: '标题',
        key: 'title',
        type: 'input',
        span: 24,
        props: {
            placeholder: '请输入标题'
        }
    },
    {
        label: '头像（单文件）',
        key: 'avatar',
        type: 'upload',
        span: 12,
        props: {
            limit: 1, // 限制 1 个文件，返回字符串
            listType: 'picture-card',
            accept: 'image/*'
        }
    },
    {
        label: '图片集（多文件）',
        key: 'images',
        type: 'upload',
        span: 12,
        props: {
            limit: 5, // 限制 5 个文件，返回字符串数组
            listType: 'picture-card',
            accept: 'image/*'
        }
    },
    {
        label: '文档附件',
        key: 'documents',
        type: 'upload',
        span: 24,
        props: {
            limit: 3,
            listType: 'text', // 文本列表样式
            accept: '.pdf,.doc,.docx,.xls,.xlsx'
        }
    }
]

// 表单验证规则
const rules: FormRules = {
    title: [
        { required: true, message: '请输入标题', trigger: 'blur' }
    ],
    avatar: [
        { required: true, message: '请上传头像', trigger: 'change' }
    ]
}

// 提交表单
const handleSubmit = async () => {
    try {
        await formRef.value?.validate()

        console.log('=== 表单提交数据 ===')
        console.log('标题:', formData.value.title)
        console.log('头像 (字符串):', formData.value.avatar)
        console.log('图片集 (数组):', formData.value.images)
        console.log('文档 (数组):', formData.value.documents)
        console.log('完整数据:', formData.value)

        ElMessage.success('表单提交成功！请查看控制台输出')

        // 这里可以调用后端 API 保存数据
        // await saveData(formData.value)
    } catch (error) {
        console.error('表单验证失败:', error)
        ElMessage.error('请检查表单填写')
    }
}
</script>

<style scoped>
.result-display {
    margin-top: 20px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.result-display h3 {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
}

.result-display pre {
    margin: 0;
    padding: 12px;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.6;
    overflow-x: auto;
}
</style>
