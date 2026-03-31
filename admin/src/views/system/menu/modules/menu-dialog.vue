<template>
  <ElDialog :title="dialogTitle" :model-value="visible" @update:model-value="handleCancel" width="860px" align-center
    class="menu-dialog" @closed="handleClosed">
    <ArtForm ref="formRef" v-model="form" :items="formItems" :rules="rules" :span="width > 640 ? 12 : 24" :gutter="20"
      label-width="100px" :show-reset="false" :show-submit="false">
      <template #menuType>
        <ElRadioGroup v-model="form.menuType" :disabled="disableMenuType">
          <ElRadioButton value="menu" label="menu">菜单</ElRadioButton>
          <ElRadioButton value="button" label="button">按钮</ElRadioButton>
        </ElRadioGroup>
      </template>
    </ArtForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'
import { ElIcon, ElTooltip } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { formatMenuTitle } from '@/utils/router'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()

/**
 * 创建带 tooltip 的表单标签
 */
const createLabelTooltip = (label: string, tooltip: string) => {
  return () =>
    h('span', { class: 'flex items-center' }, [
      h('span', label),
      h(
        ElTooltip,
        {
          content: tooltip,
          placement: 'top'
        },
        () => h(ElIcon, { class: 'ml-0.5 cursor-help' }, () => h(QuestionFilled))
      )
    ])
}

interface MenuFormData {
  menuType: 'menu' | 'button'
  menuId?: number
  btnId?: number
  title: string
  name?: string
  path?: string
  component?: string
  icon?: string
  status: boolean
  sort: number
  keepAlive: boolean
  isHide: boolean
  isHideTab: boolean
  link?: string
  isIframe: boolean
  showBadge: boolean
  isFullPage: boolean
  showTextBadge?: string
  fixedTab: boolean
  activePath?: string
  parentId?: number
  permission?: string
}

interface Props {
  visible: boolean
  editData?: any
  type?: 'menu' | 'button'
  lockType?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: MenuFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  type: 'menu',
  lockType: false
})

const emit = defineEmits<Emits>()

const formRef = ref()
const isEdit = ref(false)
const loading = ref(false)

const form = reactive<MenuFormData>({
  menuType: 'menu',
  title: '',
  name: '',
  path: '',
  component: '',
  icon: '',
  status: true,
  sort: 0,
  keepAlive: true,
  isHide: false,
  isHideTab: false,
  link: '',
  isIframe: false,
  showBadge: false,
  isFullPage: false,
  showTextBadge: '',
  fixedTab: false,
  activePath: '',
  parentId: 0,
  permission: ''
})

const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
  name: [{ required: true, message: '请输入路由名称', trigger: 'blur' }],
  permission: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
})

/**
 * 表单项配置
 */
const formItems = computed<FormItem[]>(() => {
  const baseItems: FormItem[] = [{ label: '菜单类型', key: 'menuType', span: 24 }]

  const switchSpan = width.value < 640 ? 12 : 6

  if (form.menuType === 'menu') {
    return [
      ...baseItems,
      { label: '菜单名称', key: 'title', type: 'input', props: { placeholder: '菜单名称' } },
      {
        label: createLabelTooltip(
          '路由地址',
          '一级菜单：以 / 开头的绝对路径（如 /dashboard）\n二级及以下：相对路径（如 console、user）'
        ),
        key: 'path',
        type: 'input',
        props: { placeholder: '如：/dashboard 或 console' }
      },
      { label: '路由名称', key: 'name', type: 'input', props: { placeholder: '如：Dashboard' } },
      {
        label: createLabelTooltip(
          '组件路径',
          '一级父级菜单：填写 /index/index\n具体页面：填写组件路径（如 /system/user）\n目录菜单：留空'
        ),
        key: 'component',
        type: 'input',
        props: { placeholder: '如：/system/user 或留空' }
      },
      { label: '图标', key: 'icon', type: 'input', props: { placeholder: '如：ri:user-line' } },
      {
        label: '菜单排序',
        key: 'sort',
        type: 'number',
        props: { min: 0, controlsPosition: 'right', style: { width: '100%' } }
      },
      {
        label: '外部链接',
        key: 'link',
        type: 'input',
        props: { placeholder: '如：https://www.example.com' }
      },
      {
        label: '文本徽章',
        key: 'showTextBadge',
        type: 'input',
        props: { placeholder: '如：New、Hot' }
      },
      {
        label: createLabelTooltip(
          '激活路径',
          '用于详情页等隐藏菜单，指定高亮显示的父级菜单路径\n例如：用户详情页高亮显示"用户管理"菜单'
        ),
        key: 'activePath',
        type: 'input',
        props: { placeholder: '如：/system/user' }
      },
      { label: '是否启用', key: 'status', type: 'switch', span: switchSpan },
      { label: '页面缓存', key: 'keepAlive', type: 'switch', span: switchSpan },
      { label: '隐藏菜单', key: 'isHide', type: 'switch', span: switchSpan },
      { label: '是否内嵌', key: 'isIframe', type: 'switch', span: switchSpan },
      { label: '显示徽章', key: 'showBadge', type: 'switch', span: switchSpan },
      { label: '固定标签', key: 'fixedTab', type: 'switch', span: switchSpan },
      { label: '标签隐藏', key: 'isHideTab', type: 'switch', span: switchSpan },
      { label: '全屏页面', key: 'isFullPage', type: 'switch', span: switchSpan }
    ]
  } else {
    return [
      ...baseItems,
      {
        label: '权限名称',
        key: 'title',
        type: 'input',
        props: { placeholder: '如：新增、编辑、删除' }
      },
      {
        label: '权限标识',
        key: 'permission',
        type: 'input',
        props: { placeholder: '如：system:menu:create' }
      },
      {
        label: '权限排序',
        key: 'sort',
        type: 'number',
        props: { min: 0, controlsPosition: 'right', style: { width: '100%' } }
      },
      { label: '是否启用', key: 'status', type: 'switch', span: switchSpan }
    ]
  }
})

const dialogTitle = computed(() => {
  const type = form.menuType === 'menu' ? '菜单' : '按钮'
  return isEdit.value ? `编辑${type}` : `新建${type}`
})

/**
 * 是否禁用菜单类型切换
 */
const disableMenuType = computed(() => {
  // 编辑模式下，禁用类型切换
  if (isEdit.value) return true
  // 新增模式下，如果 lockType 为 true，禁用类型切换（只能创建菜单）
  if (props.lockType) return true
  // 其他情况允许切换
  return false
})

/**
 * 重置表单数据
 */
const resetForm = (): void => {
  formRef.value?.reset()
  // 清除所有 ID 字段，避免新增时误用旧数据
  delete form.menuId
  delete form.btnId
  form.menuType = 'menu'
  form.title = ''
  form.name = ''
  form.path = ''
  form.component = ''
  form.icon = ''
  form.status = true
  form.sort = 0
  form.keepAlive = true
  form.isHide = false
  form.isHideTab = false
  form.link = ''
  form.isIframe = false
  form.showBadge = false
  form.showTextBadge = ''
  form.fixedTab = false
  form.isFullPage = false
  form.activePath = ''
  form.parentId = 0
  form.permission = ''
}

/**
 * 加载表单数据（编辑模式）
 */
const loadFormData = (): void => {
  loading.value = false
  if (!props.editData) {
    isEdit.value = false
    return
  }
  // 如果 editData 只有 parentMenuId，说明是新增子项，不是编辑
  if (props.editData.parentMenuId && !props.editData.menuId && !props.editData.btnId) {
    isEdit.value = false
    // 清除可能残留的 ID
    delete form.menuId
    delete form.btnId
    // 如果是新增菜单，设置 parentId
    if (form.menuType === 'menu') {
      form.parentId = props.editData.parentMenuId
    } else {
      // 如果是新增按钮，设置 menuId（关联的菜单 ID）
      form.menuId = props.editData.parentMenuId
    }
    return
  }
  // 检查是否真的是编辑模式（必须有 menuId 或 btnId）
  const hasMenuId = props.editData.menuId && typeof props.editData.menuId === 'number'
  const hasBtnId = props.editData.btnId && typeof props.editData.btnId === 'number'
  if (!hasMenuId && !hasBtnId) {
    isEdit.value = false
    // 清除可能残留的 ID
    delete form.menuId
    delete form.btnId
    return
  }
  isEdit.value = true
  if (form.menuType === 'menu') {
    const row = props.editData
    form.menuId = row.menuId
    form.title = row.title || ''
    form.path = row.path || ''
    form.name = row.name || ''
    form.component = row.component || ''
    form.icon = row.icon || ''
    form.sort = row.sort || 0
    form.status = row.status ?? true
    form.keepAlive = row.keepAlive ?? true
    form.isHide = row.isHide ?? false
    form.isHideTab = row.isHideTab ?? false
    form.link = row.link || ''
    form.isIframe = row.isIframe ?? false
    form.showBadge = row.showBadge ?? false
    form.isFullPage = row.isFullPage ?? false
    form.showTextBadge = row.showTextBadge || ''
    form.fixedTab = row.fixedTab ?? false
    form.activePath = row.activePath || ''
    form.parentId = row.parentId || 0
  } else {
    const row = props.editData
    // 优先使用 btnId，因为 menuId 可能是字符串格式（用于 rowKey）
    form.btnId = row.btnId
    form.menuId = row.parentMenuId
    form.title = formatMenuTitle(row.title) || ''
    form.permission = row.permission || ''
    form.sort = row.sort || 0
    form.status = row.status ?? true
  }
}

/**
 * 提交表单
 */
const handleSubmit = async (): Promise<void> => {
  if (!formRef.value) return

  try {
    loading.value = true
    await formRef.value.validate()
    emit('submit', { ...form })
    handleCancel()
  } catch {
    loading.value = false
    ElMessage.error('表单校验失败，请检查输入')
  }
}

/**
 * 取消操作
 */
const handleCancel = (): void => {
  emit('update:visible', false)
}

/**
 * 对话框关闭后的回调
 */
const handleClosed = (): void => {
  resetForm()
  isEdit.value = false
}

/**
 * 监听对话框显示状态
 */
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // 先重置表单，清除旧数据
      resetForm()
      // 设置菜单类型
      form.menuType = props.type
      nextTick(() => {
        if (props.editData) {
          loadFormData()
        }
      })
    }
  }
)

/**
 * 监听菜单类型变化
 */
watch(
  () => props.type,
  (newType) => {
    if (props.visible) {
      form.menuType = newType
    }
  }
)

/**
 * 监听 menuType 变化，重新加载数据
 */
watch(
  () => form.menuType,
  () => {
    if (props.visible && props.editData) {
      loadFormData()
    }
  }
)
</script>
