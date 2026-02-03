<template>
  <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加用户' : '编辑用户'" width="30%" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="formData.username" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="密码" prop="password">
        <ElInput v-model="formData.password" placeholder="请输入密码" />
      </ElFormItem>
      <ElFormItem label="昵称" prop="nickname">
        <ElInput v-model="formData.nickname" placeholder="请输入昵称" />
      </ElFormItem>
      <ElFormItem label="邮箱" prop="email">
        <ElInput v-model="formData.email" placeholder="请输入邮箱" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="formData.phone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="性别" prop="sex">
        <ElSelect v-model="formData.sex">
          <ElOption v-for="item in system_user_sex" :label="item.dictLabel" :value="item.dictValue" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="角色" prop="role">
        <ElSelect v-model="formData.role" multiple>
          <ElOption v-for="role in roleList" :key="role.roleId" :value="role.roleId as number" :label="role.roleName" />
        </ElSelect>
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
import { useDictStore } from '@/store/modules/dict';
import { fetchCreateUser, fetchUpdateUser } from '@/api/system/user';
import { fetchGetRoleOptions } from '@/api/system/role';
import { fetchGetDeptOptions } from '@/api/system/dept';

const dictStore = useDictStore()
const { system_user_sex } = dictStore.getDictData(['system_user_sex']);
interface Props {
  visible: boolean
  type: string
  userData?: Partial<Api.SystemUser.UserListItem>
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 部门列表数据
const deptTree = ref<Api.SystemDept.DeptListItem[]>([])

// 角色列表数据
const roleList = ref<Api.SystemRole.RoleListItem[]>([])

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
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  sex: undefined,
  deptId: undefined,
  role: [] as number[]
})

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
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
  sex: [{ required: true, message: '请选择性别', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'blur' }]
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
  const isEdit = props.type === 'edit' && props.userData
  const row = props.userData

  Object.assign(formData, {
    username: isEdit && row ? row.username || '' : '',
    phone: isEdit && row ? row.phone || '' : '',
    sex: isEdit && row ? row.sex || undefined : undefined,
    role: []
  })
}

// 获取角色下拉选项数据
function handleGetRoleOptions() {
  if (!roleList.value.length) {
    fetchGetRoleOptions().then(res => {
      roleList.value = res || []
    })
  }
}

// 获取部门下拉选项数据
function handleGetDeptOptions() {
  if (!deptTree.value.length) {
    fetchGetDeptOptions().then(res => {
      deptTree.value = res || []
    })
  }
}


/**
 * 监听对话框状态变化
 * 当对话框打开时初始化表单数据并清除验证状态
 */
watch(
  () => [props.visible, props.type, props.userData],
  ([visible]) => {
    if (visible) {
      initFormData()
      nextTick(() => {
        handleGetRoleOptions()
        handleGetDeptOptions()
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
      emit('submit')
    }
  })
}
</script>
