<template>
  <ElDialog v-model="visible" :title="dialogType === 'add' ? '新增角色' : '编辑角色'" width="450px" align-center
    @closed="handleClosed">
    <ArtForm ref="formRef" v-model="form" :items="formItems" :rules="rules" :span="24" label-width="80px"
      :show-reset="false" :show-submit="false" />
    <template #footer>
      <ElButton @click="handleClosed">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import { fetchCreateRole, fetchUpdateRole } from '@/api/system/role'

type RoleListItem = Api.SystemRole.RoleListItem

interface Props {
  modelValue: boolean
  dialogType: 'add' | 'edit'
  roleData?: RoleListItem
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  dialogType: 'add',
  roleData: undefined
})

const emit = defineEmits<Emits>()

const formRef = ref()

/**
 * 弹窗显示状态双向绑定
 */
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/**
 * 表单数据
 */
const form = reactive<RoleListItem>({
  roleId: undefined,
  roleName: '',
  roleCode: '',
  sort: 0,
  remark: '',
  status: true
})

/**
 * 表单项配置
 */
const formItems: FormItem[] = [
  {
    label: '角色名称',
    key: 'roleName',
    type: 'input',
    props: { placeholder: '请输入角色名称' }
  },
  {
    label: '角色编码',
    key: 'roleCode',
    type: 'input',
    props: { placeholder: '请输入角色编码' }
  },
  {
    label: '排序',
    key: 'sort',
    type: 'number',
    props: { placeholder: '请输入排序', controlsPosition: 'right', style: { width: '100%' }, min: 0 }
  },
  {
    label: '状态',
    key: 'status',
    type: 'switch'
  },
  {
    label: '描述',
    key: 'remark',
    type: 'input',
    props: { type: 'textarea', rows: 3, placeholder: '请输入角色描述' }
  },
]

/**
 * 表单验证规则
 */
const rules = reactive<FormRules>({
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
})

/**
 * 监听弹窗打开，初始化表单数据
 */
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      nextTick(() => {
        initFormData()
      })
    }
  }
)

/**
 * 初始化表单数据
 * 根据弹窗类型填充表单或重置表单
 */
const initFormData = () => {
  const isEdit = props.dialogType === 'edit' && props.roleData
  const row = props.roleData || {}
  Object.assign(form, {
    ...row,
    roleId: isEdit && row.roleId ? row.roleId || undefined : undefined,
    roleName: isEdit && row.roleName ? row.roleName || '' : '',
    roleCode: isEdit && row.roleCode ? row.roleCode || '' : '',
    sort: isEdit && row.sort ? row.sort || 0 : 0,
    remark: isEdit && row.remark ? row.remark || '' : '',
    status: isEdit ? row.status : true,
  })
}

/**
 * 对话框关闭后的回调
 */
const handleClosed = () => {
  formRef.value?.reset()
  visible.value = false
}

/**
 * 提交表单
 * 验证通过后调用接口保存数据
 */
const handleSubmit = async () => {
  if (!formRef.value) return
  formRef.value.validate().then(async () => {
    if (props.dialogType == 'add') {
      await fetchCreateRole(form)
    } else {
      await fetchUpdateRole(form)
    }
    emit('submit')
    visible.value = false
  }).catch(() => {
    ElMessage.error('表单校验失败，请检查输入')
  })
}
</script>
