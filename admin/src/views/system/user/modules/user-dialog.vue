<template>
  <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加用户' : '编辑用户'" width="800px" align-center
    @closed="handleClosed">
    <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="12" label-width="80px"
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
import { useDictStore } from '@/store/modules/dict'
import { fetchCreateUser, fetchUpdateUser, fetchGetUserDetail } from '@/api/system/user'
import { fetchGetRoleOptions } from '@/api/system/role'
import { fetchGetDeptOptions } from '@/api/system/dept'

const dictStore = useDictStore()
const { system_user_sex } = dictStore.getDictData(['system_user_sex'])

interface Props {
  visible: boolean
  type: string
  data?: Partial<Api.SystemUser.UserListItem>
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

// 部门列表数据
const deptTree = ref<Api.SystemDept.DeptListItem[]>([])

// 角色列表数据
const roleList = ref<Api.SystemRole.RoleListItem[]>([])

// 表单数据
const formData = reactive({
  userId: undefined,
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  sex: undefined,
  deptId: undefined,
  roles: [] as number[],
  status: true,
  remark: ''
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
    label: '用户名',
    key: 'username',
    type: 'input',
    props: { placeholder: '请输入用户名', disabled: dialogType.value === 'edit' }
  },
  ...(dialogType.value === 'add' ? [{
    label: '密码',
    key: 'password',
    type: 'input',
    props: { placeholder: '请输入密码', type: 'password', showPassword: true }
  }] : []),
  {
    label: '昵称',
    key: 'nickname',
    type: 'input',
    props: { placeholder: '请输入昵称' }
  },
  {
    label: '邮箱',
    key: 'email',
    type: 'input',
    props: { placeholder: '请输入邮箱' }
  },
  {
    label: '手机号',
    key: 'phone',
    type: 'input',
    props: { placeholder: '请输入手机号' }
  },
  {
    label: '性别',
    key: 'sex',
    type: 'select',
    props: {
      placeholder: '请选择性别',
      options: system_user_sex.value.map((item: any) => ({
        label: item.dictLabel,
        value: item.dictValue
      }))
    }
  },
  {
    label: '所属部门',
    key: 'deptId',
    type: 'cascader',
    props: {
      options: deptTree.value,
      props: cascaderProps,
      placeholder: '请选择所属部门',
      clearable: true,
      showAllLevels: false,
      style: { width: '100%' }
    }
  },
  {
    label: '角色',
    key: 'roles',
    type: 'select',
    props: {
      placeholder: '请选择角色',
      multiple: true,
      options: roleList.value.map((role: any) => ({
        label: role.roleName,
        value: role.roleId
      })),
      style: { width: '100%' }
    }
  },
  {
    label: '用户状态',
    key: 'status',
    type: 'switch'
  },
  {
    label: '备注',
    key: 'remark',
    type: 'input',
    span: 24,
    props: { type: 'textarea', rows: 3, placeholder: '请输入备注' }
  }
])

// 表单验证规则
const rules = computed<FormRules>(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  ...(dialogType.value === 'add' ? {
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ]
  } : {}),
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }]
}))

// 获取角色下拉选项数据
const handleGetRoleOptions = async () => {
  if (!roleList.value.length) {
    const res = await fetchGetRoleOptions()
    roleList.value = res || []
  }
}

// 获取部门下拉选项数据
const handleGetDeptOptions = async () => {
  if (!deptTree.value.length) {
    const res = await fetchGetDeptOptions()
    deptTree.value = res || []
  }
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
  const isEdit = props.type === 'edit' && props.data
  const row = props.data || {}
  if (isEdit && row.userId) {
    fetchGetUserDetail(row.userId).then(res => {
      if (res) Object.assign(formData, res)
    })
  }
}

/**
 * 监听对话框状态变化
 * 当对话框打开时初始化表单数据
 */
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      nextTick(async () => {
        await handleGetRoleOptions()
        await handleGetDeptOptions()
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
  try {
    await formRef.value.validate()
    if (dialogType.value === 'add') {
      await fetchCreateUser(formData)
    } else {
      await fetchUpdateUser(formData)
    }
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
    emit('submit')
    dialogVisible.value = false
  } catch {
    ElMessage.error('表单校验失败，请检查输入')
  }
}

/**
 * 对话框关闭后的回调
 */
const handleClosed = () => {
  formRef.value?.reset()
}
</script>

<style scoped lang='scss'></style>
