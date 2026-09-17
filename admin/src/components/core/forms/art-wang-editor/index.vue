<!-- WangEditor 富文本编辑器 插件地址：https://www.wangeditor.com/ -->
<template>
  <div class="editor-wrapper">
    <Toolbar class="editor-toolbar" :editor="editorRef" :mode="mode" :defaultConfig="toolbarConfig" />
    <Editor :style="{ height: height, overflowY: 'hidden' }" v-model="modelValue" :mode="mode"
      :defaultConfig="editorConfig" @onCreated="onCreateEditor" />
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, onMounted, shallowRef, computed } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { fetchGeneratePresign } from '@/api/system/storage'
import EmojiText from '@/utils/ui/emojo'
import { IDomEditor, IToolbarConfig, IEditorConfig } from '@wangeditor/editor'

defineOptions({ name: 'ArtWangEditor' })

// Props 定义
interface Props {
  /** 编辑器高度 */
  height?: string
  /** 自定义工具栏配置 */
  toolbarKeys?: string[]
  /** 插入新工具到指定位置 */
  insertKeys?: { index: number; keys: string[] }
  /** 排除的工具栏项 */
  excludeKeys?: string[]
  /** 编辑器模式 */
  mode?: 'default' | 'simple'
  /** 占位符文本 */
  placeholder?: string
  /** 上传配置（本地限制，走系统预签名上传） */
  uploadConfig?: {
    maxFileSize?: number
    maxNumberOfFiles?: number
    maxVideoFileSize?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  height: '500px',
  mode: 'default',
  placeholder: '请输入内容...',
  excludeKeys: () => ['fontFamily']
})

const modelValue = defineModel<string>({ required: true })

// 编辑器实例
const editorRef = shallowRef<IDomEditor>()

const IMAGE_MAX_SIZE = 3 * 1024 * 1024 // 3MB
const VIDEO_MAX_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_NUMBER_OF_FILES = 10

/**
 * 预签名上传文件，返回可访问 URL（去除查询参数）
 */
async function uploadByPresign(file: File): Promise<string> {
  const presignUrl = await fetchGeneratePresign({ fileName: file.name })
  const response = await fetch(presignUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' }
  })
  if (!response.ok) {
    throw new Error(`上传失败: ${response.status} ${response.statusText}`)
  }
  return presignUrl.split('?')[0]
}

// 工具栏配置
const toolbarConfig = computed((): Partial<IToolbarConfig> => {
  const config: Partial<IToolbarConfig> = {}

  if (props.toolbarKeys && props.toolbarKeys.length > 0) {
    config.toolbarKeys = props.toolbarKeys
  }

  if (props.insertKeys) {
    config.insertKeys = props.insertKeys
  }

  if (props.excludeKeys && props.excludeKeys.length > 0) {
    config.excludeKeys = props.excludeKeys
  }

  return config
})

const imageMaxFileSize = props.uploadConfig?.maxFileSize ?? IMAGE_MAX_SIZE
const videoMaxFileSize = props.uploadConfig?.maxVideoFileSize ?? VIDEO_MAX_SIZE
const maxNumberOfFiles = props.uploadConfig?.maxNumberOfFiles ?? MAX_NUMBER_OF_FILES

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      maxFileSize: imageMaxFileSize,
      maxNumberOfFiles,
      allowedFileTypes: ['image/*'],
      base64LimitSize: 0,
      async customUpload(file: File, insertFn: (url: string, alt: string, href: string) => void) {
        try {
          const url = await uploadByPresign(file)
          insertFn(url, file.name, url)
          ElMessage.success(`图片上传成功 ${EmojiText[200]}`)
        } catch (err) {
          console.error('图片上传失败:', err)
          ElMessage.error(`图片上传失败 ${EmojiText[500]}`)
        }
      }
    },
    uploadVideo: {
      maxFileSize: videoMaxFileSize,
      maxNumberOfFiles,
      allowedFileTypes: ['video/*'],
      async customUpload(file: File, insertFn: (url: string, poster?: string) => void) {
        try {
          const url = await uploadByPresign(file)
          insertFn(url)
          ElMessage.success(`视频上传成功 ${EmojiText[200]}`)
        } catch (err) {
          console.error('视频上传失败:', err)
          ElMessage.error(`视频上传失败 ${EmojiText[500]}`)
        }
      }
    }
  }
}

// 编辑器创建回调
const onCreateEditor = (editor: IDomEditor) => {
  editorRef.value = editor

  editor.on('fullScreen', () => {
    console.log('编辑器进入全屏模式')
  })

  applyCustomIcons()
}

// 应用自定义图标（带重试机制）
const applyCustomIcons = () => {
  let retryCount = 0
  const maxRetries = 10
  const retryDelay = 100

  const tryApplyIcons = () => {
    const editor = editorRef.value
    if (!editor) {
      if (retryCount < maxRetries) {
        retryCount++
        setTimeout(tryApplyIcons, retryDelay)
      }
      return
    }

    const editorContainer = editor.getEditableContainer().closest('.editor-wrapper')
    if (!editorContainer) {
      if (retryCount < maxRetries) {
        retryCount++
        setTimeout(tryApplyIcons, retryDelay)
      }
      return
    }

    const toolbar = editorContainer.querySelector('.w-e-toolbar')
    const toolbarButtons = editorContainer.querySelectorAll('.w-e-bar-item button[data-menu-key]')

    if (toolbar && toolbarButtons.length > 0) {
      return
    }

    if (retryCount < maxRetries) {
      retryCount++
      setTimeout(tryApplyIcons, retryDelay)
    } else {
      console.warn('工具栏渲染超时，无法应用自定义图标 - 编辑器实例:', editor.id)
    }
  }

  requestAnimationFrame(tryApplyIcons)
}

defineExpose({
  /** 获取编辑器实例 */
  getEditor: () => editorRef.value,
  /** 设置编辑器内容 */
  setHtml: (html: string) => editorRef.value?.setHtml(html),
  /** 获取编辑器内容 */
  getHtml: () => editorRef.value?.getHtml(),
  /** 清空编辑器 */
  clear: () => editorRef.value?.clear(),
  /** 聚焦编辑器 */
  focus: () => editorRef.value?.focus()
})

onMounted(() => {
  // 图标替换已在 onCreateEditor 中处理
})

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
})
</script>

<style lang="scss">
@use './style';
</style>