<template>
    <ElDialog v-model="dialogVisible" :title="title" width="800px" align-center @closed="handleClosed">
        <ArtForm ref="formConfigRef" v-model="formData" :items="formItems" :rules="rules" :span="24" label-width="80px"
            :show-reset="false" :show-submit="false" />
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="dialogVisible = false">取消</ElButton>
                <ElButton type="danger" :loading="loading" @click="handleDelete">删除</ElButton>
                <ElButton type="primary" :loading="loading" @click="handleSubmit">提交</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDictStore } from '@/store/modules/dict'
import { fetchCreateMerchantConfig, fetchGetMerchantConfig, fetchUpdateMerchantConfig, fetchDeleteMerchantConfig } from '@/api/business/merchant'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'

type MerchantConfigItem = Api.BusinessMerchant.MerchantConfigItem

interface Props {
    visible: boolean
    type: string
    data?: Partial<MerchantConfigItem>
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dictStore = useDictStore()
const { system_pay_method } = dictStore.getDictData(['system_pay_method'])

// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})
const loading = ref(false)

const title = computed(() => (props.type === 'add' ? '新增商户配置' : '编辑商户配置'))

// 表单实例
const formConfigRef = ref()

// 表单数据
const formData = ref<Partial<MerchantConfigItem>>()

// 计算可配置的支付渠道
const availableChannels = computed(() => {
    const usedChannels = (props?.data?.usedChannel || [])
    console.log(props.data)
    const availableChannels = system_pay_method.value.filter((item: any) => !usedChannels.includes(item.dictValue))
    return availableChannels.map((item: any) => ({
        label: item.dictLabel,
        value: item.dictValue
    }))
})

// 表单项配置
const formItems = computed<FormItem[]>(() => [
    {
        label: '商户名称',
        span: 12,
        key: 'merchantName',
        type: 'input',
        props: { placeholder: '请输入商户名称', readonly: true, }
    },
    {
        label: '支付渠道',
        span: 12,
        key: 'channel',
        type: 'select',
        props: {
            placeholder: '请选择支付渠道',
            disabled: props.type === 'edit',
            options: availableChannels.value,
        }
    },
    {
        label: 'APPID',
        span: 12,
        key: 'appId',
        type: 'input',
        props: { placeholder: '请输入APPID', clearable: true }
    },
    {
        label: '商户ID',
        span: 12,
        key: 'mchId',
        type: 'input',
        props: { placeholder: '请输入商户ID/商户号', clearable: true }
    },
    {
        label: '私钥',
        span: 12,
        key: 'privateKey',
        type: 'input',
        props: { placeholder: '请输入私钥', clearable: true }
    },
    {
        label: '公钥',
        span: 12,
        key: 'publicKey',
        type: 'input',
        props: { placeholder: '请输入公钥', clearable: true }
    },
    {
        label: '扩展配置',
        key: 'config',
        type: 'input',
        props: { type: 'textarea', rows: 2, placeholder: '请输入扩展配置', clearable: true }
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
    merchantName: [{ required: true, message: '请选择商户', trigger: ['blur'] }],
    channel: [{ required: true, message: '请选择支付渠道', trigger: ['blur'] }],
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
    loading.value = false
    const isEdit = props.type === 'edit' && props.data
    const row = props.data || {}
    if (isEdit && row.id) {
        fetchGetMerchantConfig(row.id!).then((res) => {
            formData.value = {
                ...res,
                merchantName: row.merchantName!,
            }
        })
    } else {
        formData.value = {
            merchantId: row.merchantId!,
            merchantName: row.merchantName!,
            status: true,
            remark: ''
        }
    }
}

function handleDelete() {
    const id = formData.value?.id
    if (!id) return
    ElMessageBox.confirm('确认删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        loading.value = true
        await fetchDeleteMerchantConfig(id)
        emit('submit')
        dialogVisible.value = false
    }).catch(() => {
        ElMessage.info('已取消删除')
    }).finally(() => {
        loading.value = false
    })
}

/**
 * 提交表单
 * 验证通过后触发提交事件
 */
const handleSubmit = () => {
    if (!formConfigRef.value) return
    formConfigRef.value.validate().then(async () => {
        try {
            loading.value = true
            const obj = JSON.parse(JSON.stringify(formData.value!))
            delete obj.merchantName
            if (props.type === 'add') {
                await fetchCreateMerchantConfig(obj)
            } else {
                await fetchUpdateMerchantConfig(obj)
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
    formConfigRef.value?.reset()
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

</script>

<style scoped lang='scss'></style>