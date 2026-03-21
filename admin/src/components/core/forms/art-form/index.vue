<!-- 表单组件 -->
<!-- 支持常用表单组件、自定义组件、插槽、校验、隐藏表单项 -->
<!-- 写法同 ElementPlus 官方文档组件，把属性写在 props 里面就可以了 -->
<template>
  <section class="px-4 pb-0 pt-4 md:px-4 md:pt-4">
    <ElForm ref="formRef" :model="modelValue" :label-position="labelPosition" v-bind="{ ...$attrs }">
      <ElRow class="flex flex-wrap" :gutter="gutter">
        <ElCol v-for="item in visibleFormItems" :key="item.key" :xs="getColSpan(item.span, 'xs')"
          :sm="getColSpan(item.span, 'sm')" :md="getColSpan(item.span, 'md')" :lg="getColSpan(item.span, 'lg')"
          :xl="getColSpan(item.span, 'xl')">
          <ElFormItem :prop="item.key" :label-width="item.label ? item.labelWidth || labelWidth : undefined">
            <template #label v-if="item.label">
              <component v-if="typeof item.label !== 'string'" :is="item.label" />
              <span v-else>{{ item.label }}</span>
            </template>
            <slot :name="item.key" :item="item" :modelValue="modelValue">
              <!-- 文件上传组件特殊处理 -->
              <template v-if="item.type === 'upload'">
                <ElUpload v-bind="getUploadProps(item)" class="art-upload">
                  <template v-if="(getProps(item) as any)?.listType === 'picture-card'">
                    <ElIcon>
                      <Plus />
                    </ElIcon>
                  </template>
                  <template v-else>
                    <ElButton type="primary">点击上传</ElButton>
                  </template>
                </ElUpload>
                <!-- 图片预览对话框 -->
                <ElDialog v-model="previewDialogVisible[item.key]" width="800px" align-center>
                  <img :src="previewImageUrl[item.key]" alt="预览图片" class="w-full" />
                </ElDialog>
              </template>

              <!-- 其他组件 -->
              <component v-else :is="getComponent(item)" v-model="modelValue[item.key]" v-bind="getProps(item)">
                <!-- 下拉选择 -->
                <template v-if="item.type === 'select' && getProps(item)?.options">
                  <ElOption v-for="option in getProps(item).options" v-bind="option" :key="option.value" />
                </template>

                <!-- 复选框组 -->
                <template v-if="item.type === 'checkboxgroup' && getProps(item)?.options">
                  <ElCheckbox v-for="option in getProps(item).options" v-bind="option" :key="option.value" />
                </template>

                <!-- 单选框组 -->
                <template v-if="item.type === 'radiogroup' && getProps(item)?.options">
                  <ElRadio v-for="option in getProps(item).options" v-bind="option" :key="option.value" />
                </template>

                <!-- 动态插槽支持 -->
                <template v-for="(slotFn, slotName) in getSlots(item)" :key="slotName" #[slotName]>
                  <component :is="slotFn" />
                </template>
              </component>
            </slot>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="span" :lg="span" :xl="span" class="max-w-full flex-1">
          <div class="mb-3 flex-c flex-wrap justify-end md:flex-row md:items-stretch md:gap-2"
            :style="actionButtonsStyle">
            <div class="flex gap-2 md:justify-center">
              <ElButton v-if="showReset" class="reset-button" @click="handleReset" v-ripple>
                {{ t('table.form.reset') }}
              </ElButton>
              <ElButton v-if="showSubmit" type="primary" class="submit-button" @click="handleSubmit" v-ripple
                :disabled="disabledSubmit">
                {{ t('table.form.submit') }}
              </ElButton>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>
  </section>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import {
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElDatePicker,
  ElInput,
  ElInputTag,
  ElInputNumber,
  ElRadioGroup,
  ElRate,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTimeSelect,
  ElTreeSelect,
  ElUpload,
  ElMessage,
  type FormInstance,
  type UploadProps,
  type UploadUserFile
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fetchGeneratePresign } from '@/api/system/storage'
import { calculateResponsiveSpan, type ResponsiveBreakpoint } from '@/utils/form/responsive'

defineOptions({ name: 'ArtForm' })

const componentMap = {
  input: ElInput, // 输入框
  inputtag: ElInputTag, // 标签输入框
  number: ElInputNumber, // 数字输入框
  select: ElSelect, // 选择器
  switch: ElSwitch, // 开关
  checkbox: ElCheckbox, // 复选框
  checkboxgroup: ElCheckboxGroup, // 复选框组
  radiogroup: ElRadioGroup, // 单选框组
  date: ElDatePicker, // 日期选择器
  daterange: ElDatePicker, // 日期范围选择器
  datetime: ElDatePicker, // 日期时间选择器
  datetimerange: ElDatePicker, // 日期时间范围选择器
  rate: ElRate, // 评分
  slider: ElSlider, // 滑块
  cascader: ElCascader, // 级联选择器
  timepicker: ElTimePicker, // 时间选择器
  timeselect: ElTimeSelect, // 时间选择
  treeselect: ElTreeSelect, // 树选择器
  upload: ElUpload // 文件上传
}

const { width } = useWindowSize()
const { t } = useI18n()
const isMobile = computed(() => width.value < 500)

const formInstance = useTemplateRef<FormInstance>('formRef')

// 表单项配置
export interface FormItem {
  /** 表单项的唯一标识 */
  key: string
  /** 表单项的标签文本或自定义渲染函数 */
  label: string | (() => VNode) | Component
  /** 表单项标签的宽度，会覆盖 Form 的 labelWidth */
  labelWidth?: string | number
  /** 表单项类型，支持预定义的组件类型 */
  type?: keyof typeof componentMap | string
  /** 自定义渲染函数或组件，用于渲染自定义组件（优先级高于 type） */
  render?: (() => VNode) | Component
  /** 是否隐藏该表单项 */
  hidden?: boolean
  /** 表单项占据的列宽，基于24格栅格系统 */
  span?: number
  /** 选项数据，用于 select、checkbox-group、radio-group 等 */
  options?: Record<string, any>
  /** 传递给表单项组件的属性 */
  props?: Record<string, any>
  /** 表单项的插槽配置 */
  slots?: Record<string, (() => any) | undefined>
  /** 表单项的占位符文本 */
  placeholder?: string
  /** 更多属性配置请参考 ElementPlus 官方文档 */
}

// 表单配置
interface FormProps {
  /** 表单数据 */
  items: FormItem[]
  /** 每列的宽度（基于 24 格布局） */
  span?: number
  /** 表单控件间隙 */
  gutter?: number
  /** 表单域标签的位置 */
  labelPosition?: 'left' | 'right' | 'top'
  /** 文字宽度 */
  labelWidth?: string | number
  /** 按钮靠左对齐限制（表单项小于等于该值时） */
  buttonLeftLimit?: number
  /** 是否显示重置按钮 */
  showReset?: boolean
  /** 是否显示提交按钮 */
  showSubmit?: boolean
  /** 是否禁用提交按钮 */
  disabledSubmit?: boolean
}

const props = withDefaults(defineProps<FormProps>(), {
  items: () => [],
  span: 6,
  gutter: 12,
  labelPosition: 'right',
  labelWidth: '70px',
  buttonLeftLimit: 2,
  showReset: true,
  showSubmit: true,
  disabledSubmit: false
})

interface FormEmits {
  reset: []
  submit: []
}

const emit = defineEmits<FormEmits>()

const modelValue = defineModel<Record<string, any>>({ default: {} })

const rootProps = ['label', 'labelWidth', 'key', 'type', 'hidden', 'span', 'slots']

// 文件列表状态管理（用于 Upload 组件）
const fileListMap = reactive<Record<string, UploadUserFile[]>>({})

// 图片预览状态
const previewDialogVisible = reactive<Record<string, boolean>>({})
const previewImageUrl = reactive<Record<string, string>>({})

const getProps = (item: FormItem) => {
  if (item.props) return item.props
  const props = { ...item }
  rootProps.forEach((key) => delete (props as Record<string, any>)[key])
  return props
}

// 获取插槽
const getSlots = (item: FormItem) => {
  if (!item.slots) return {}
  const validSlots: Record<string, () => any> = {}
  Object.entries(item.slots).forEach(([key, slotFn]) => {
    if (slotFn) {
      validSlots[key] = slotFn
    }
  })
  return validSlots
}

// 组件
const getComponent = (item: FormItem) => {
  // 优先使用 render 函数或组件渲染自定义组件
  if (item.render) {
    return item.render
  }
  // 使用 type 获取预定义组件
  const { type } = item
  return componentMap[type as keyof typeof componentMap] || componentMap['input']
}

/**
 * 文件上传相关逻辑
 */

// 初始化文件列表（从 modelValue 恢复）
const initFileList = (item: FormItem) => {
  const key = item.key
  const value = modelValue.value[key]

  if (!value) {
    fileListMap[key] = []
    return
  }

  // 将字符串或字符串数组转换为 UploadUserFile 格式
  const urls = Array.isArray(value) ? value : [value]
  fileListMap[key] = urls.map((url: string, index: number) => ({
    name: url.split('/').pop() || `file-${index}`,
    url: url,
    uid: Date.now() + index
  }))
}

// 获取上传配置
const getUploadProps = (item: FormItem): Partial<UploadProps> => {
  const itemProps = getProps(item) as any
  const limit = itemProps?.limit || 1

  // 初始化或同步文件列表：当 modelValue 有值但 fileListMap 未反映时，需要重新初始化
  const currentValue = modelValue.value[item.key]
  const currentUrls = Array.isArray(currentValue) ? currentValue : (currentValue ? [currentValue] : [])
  const fileListUrls = fileListMap[item.key]?.map((f) => f.url).filter(Boolean) || []
  const needSync = currentUrls.length > 0 && (
    !fileListMap[item.key] ||
    fileListUrls.length !== currentUrls.length ||
    currentUrls.some((url, i) => url !== fileListUrls[i])
  )
  if (!fileListMap[item.key] || needSync) {
    initFileList(item)
  }

  // 初始化预览状态
  if (previewDialogVisible[item.key] === undefined) {
    previewDialogVisible[item.key] = false
  }

  return {
    action: '', // 将在 httpRequest 中处理
    limit,
    fileList: fileListMap[item.key],
    listType: itemProps?.listType || 'picture-card',
    accept: itemProps?.accept,
    autoUpload: true,
    httpRequest: (options) => handleUpload(options, item),
    onRemove: (file) => handleRemove(file, item),
    onPreview: (file) => handlePreview(file, item),
    onExceed: () => {
      ElMessage.warning(`最多只能上传 ${limit} 个文件`)
    },
    ...itemProps
  }
}

// 处理文件上传
const handleUpload = async (options: any, item: FormItem) => {
  const { file, onSuccess, onError } = options
  const key = item.key
  try {
    const presignUrl = await fetchGeneratePresign({ fileName: file.name })
    const response = await fetch(presignUrl, {
      method: 'PUT',
      body: file, // 文件作为 binary 数据放在 body 中
      headers: { 'Content-Type': file.type || 'application/octet-stream' }
    })
    if (!response.ok) {
      throw new Error(`上传失败: ${response.status} ${response.statusText}`)
    }
    // 提取文件 URL（去除查询参数）
    const fileUrl = presignUrl.split('?')[0]
    // 更新文件列表
    const uploadFile: UploadUserFile = { name: file.name, url: fileUrl, uid: file.uid }
    if (!fileListMap[key]) fileListMap[key] = []
    fileListMap[key].push(uploadFile)

    // 更新 modelValue
    updateModelValue(item)
    onSuccess(response)
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('文件上传错误:', error)
    onError(error)
    ElMessage.error('上传失败，请重试')
  }
}

// 处理文件移除
const handleRemove = (file: UploadUserFile, item: FormItem) => {
  const key = item.key
  const index = fileListMap[key]?.findIndex((f) => f.uid === file.uid)

  if (index !== undefined && index > -1) {
    fileListMap[key].splice(index, 1)
    updateModelValue(item)
  }
}

// 处理图片预览
const handlePreview = (file: UploadUserFile, item: FormItem) => {
  const key = item.key
  previewImageUrl[key] = file.url || ''
  previewDialogVisible[key] = true
}

// 更新 modelValue（根据 limit 决定返回字符串还是数组）
const updateModelValue = (item: FormItem) => {
  const key = item.key
  const itemProps = getProps(item) as any
  const limit = itemProps?.limit || 1
  const urls = fileListMap[key]?.map((f) => f.url).filter(Boolean) || []

  // 如果 limit 为 1，返回字符串；否则返回数组
  modelValue.value[key] = limit === 1 ? (urls[0] || '') : urls
}

/**
 * 获取列宽 span 值
 * 根据屏幕尺寸智能降级，避免小屏幕上表单项被压缩过小
 */
const getColSpan = (itemSpan: number | undefined, breakpoint: ResponsiveBreakpoint): number => {
  return calculateResponsiveSpan(itemSpan, span.value, breakpoint)
}

/**
 * 可见的表单项
 */
const visibleFormItems = computed(() => {
  return props.items.filter((item) => !item.hidden)
})

/**
 * 操作按钮样式
 */
const actionButtonsStyle = computed(() => ({
  'justify-content': isMobile.value
    ? 'flex-end'
    : props.items.filter((item) => !item.hidden).length <= props.buttonLeftLimit
      ? 'flex-start'
      : 'flex-end'
}))

/**
 * 处理重置事件
 */
const handleReset = () => {
  // 重置表单字段（UI 层）
  formInstance.value?.resetFields()

  // 清空所有表单项值（包含隐藏项）
  Object.assign(
    modelValue.value,
    Object.fromEntries(props.items.map(({ key }) => [key, undefined]))
  )

  // 清空 upload 组件的文件列表，避免下次回显时数据不同步
  props.items.filter((i) => i.type === 'upload').forEach((i) => {
    fileListMap[i.key] = []
  })

  // 触发 reset 事件
  emit('reset')
}

/**
 * 处理提交事件
 */
const handleSubmit = () => {
  emit('submit')
}

defineExpose({
  ref: formInstance,
  validate: (...args: any[]) => formInstance.value?.validate(...args),
  reset: handleReset
})

// 解构 props 以便在模板中直接使用
const { span, gutter, labelPosition, labelWidth } = toRefs(props)
</script>

<style scoped lang="scss">
.art-upload {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }

  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
  }
}
</style>