<template>
  <ElDialog v-model="dialogVisible" class="user-dialog" width="800px" align-center append-to-body destroy-on-close
    @closed="handleClosed">
    <template #header>
      <div class="user-dialog__head">
        <div class="user-dialog__badge" :class="dialogType === 'add' ? 'is-add' : 'is-edit'">
          <ArtSvgIcon :icon="dialogType === 'add' ? 'ri:user-add-line' : 'ri:user-settings-line'" />
        </div>
        <div class="user-dialog__titles">
          <h3 class="user-dialog__title">
            {{ dialogType === 'add' ? '添加用户' : '编辑用户' }}
          </h3>
          <p class="user-dialog__sub">
            {{
              dialogType === 'add'
                ? '创建账号并分配角色与部门'
                : '更新资料、角色归属或启停状态'
            }}
          </p>
        </div>
      </div>
    </template>

    <ArtForm :key="dialogType" ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="12"
      label-width="80px" :show-reset="false" :show-submit="false" />

    <template #footer>
      <div class="user-dialog__footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">
          {{ dialogType === 'add' ? '创建用户' : '保存修改' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
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

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const dialogType = computed(() => props.type)
const formRef = ref()
const deptTree = ref<Api.SystemDept.DeptListItem[]>([])
const roleList = ref<Api.SystemRole.RoleListItem[]>([])

const getDefaultFormData = () => ({
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
  remark: '',
  avatar: ''
})

const formData = reactive(getDefaultFormData())

const cascaderProps = {
  value: 'deptId',
  label: 'deptName',
  children: 'children',
  checkStrictly: true,
  emitPath: false
}

const formItems = computed<FormItem[]>(() => [
  {
    label: '用户名',
    key: 'username',
    type: 'input',
    props: { placeholder: '请输入用户名', disabled: dialogType.value === 'edit' }
  },
  ...(dialogType.value === 'add'
    ? [
      {
        label: '密码',
        key: 'password',
        type: 'input',
        props: { placeholder: '请输入密码', type: 'password', showPassword: true }
      }
    ]
    : []),
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
    label: '头像',
    key: 'avatar',
    type: 'upload',
    props: {
      limit: 1,
      listType: 'picture-card',
      accept: 'image/*'
    }
  },
  {
    label: '备注',
    key: 'remark',
    type: 'input',
    span: 24,
    props: { type: 'textarea', rows: 3, placeholder: '请输入备注' }
  }
])

const rules = computed<FormRules>(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  ...(dialogType.value === 'add'
    ? {
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }
    : {}),
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入正确的邮箱格式',
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }]
}))

const handleGetRoleOptions = async () => {
  if (!roleList.value.length) {
    const res = await fetchGetRoleOptions()
    roleList.value = res || []
  }
}

const handleGetDeptOptions = async () => {
  if (!deptTree.value.length) {
    const res = await fetchGetDeptOptions()
    deptTree.value = res || []
  }
}

const initFormData = () => {
  loading.value = false
  Object.assign(formData, getDefaultFormData())
  if (props.type === 'edit' && props.data?.userId) {
    const userId = props.data.userId
    fetchGetUserDetail(userId).then((res) => {
      if (props.visible && props.type === 'edit' && props.data?.userId === userId && res) {
        Object.assign(formData, res)
      }
    })
  }
}

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

const handleSubmit = async () => {
  if (!formRef.value) return
  formRef.value
    .validate()
    .then(async () => {
      try {
        loading.value = true
        if (dialogType.value == 'add') {
          await fetchCreateUser(formData)
        } else {
          await fetchUpdateUser(formData)
        }
        emit('submit')
        dialogVisible.value = false
      } catch {
        loading.value = false
      }
    })
    .catch(() => {
      ElMessage.error('表单校验失败，请检查输入')
    })
}

const handleClosed = () => {
  formRef.value?.reset()
}
</script>

<style scoped lang="scss">
.user-dialog__head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-right: 28px;
}

.user-dialog__badge {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  font-size: 20px;
  flex-shrink: 0;
  border: 1px solid transparent;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  &.is-add {
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    border-color: color-mix(in srgb, var(--el-color-primary) 22%, transparent);
  }

  &.is-edit {
    color: var(--art-gray-800);
    background: var(--art-gray-100);
    border-color: var(--art-card-border);
  }
}

.user-dialog__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--art-gray-900);
  line-height: 1.3;
}

.user-dialog__sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--art-gray-500);
  line-height: 1.4;
}

.user-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

<style lang="scss">
/* ElDialog teleports to body — unscoped chrome */
.user-dialog.el-dialog {
  border-radius: calc(var(--custom-radius) + 6px);
  overflow: hidden;
  box-shadow:
    0 18px 50px color-mix(in srgb, #000 12%, transparent),
    0 2px 8px color-mix(in srgb, #000 4%, transparent);
}

.user-dialog .el-dialog__header {
  margin: 0;
  padding: 20px 20px 12px;
  border-bottom: 1px solid var(--art-card-border);
}

.user-dialog .el-dialog__body {
  padding: 20px 20px 8px;
}

.user-dialog .el-dialog__footer {
  padding: 12px 20px 18px;
  border-top: 1px solid var(--art-card-border);
  background: color-mix(in srgb, var(--art-gray-100) 55%, transparent);
}

.user-dialog.dialog-fade-enter-active {
  animation: user-dialog-in 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes user-dialog-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .user-dialog.dialog-fade-enter-active {
    animation: none;
  }
}
</style>
