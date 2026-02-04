<template>
  <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" :rules="rules" @reset="handleReset"
    @search="handleSearch">
  </ArtSearchBar>
</template>

<script setup lang="ts">
import { useDictStore } from '@/store/modules/dict'

interface Props {
  modelValue: Record<string, any>
}
interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'search', params: Record<string, any>): void
  (e: 'reset'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单数据双向绑定
const searchBarRef = ref()
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const dictStore = useDictStore()
const { system_user_sex } = dictStore.getDictData(['system_user_sex'])

// 校验规则
const rules = {
  // userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
}

// 动态 options
const statusOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])



// 表单配置
const formItems = computed(() => [
  {
    label: '用户名',
    key: 'username',
    type: 'input',
    placeholder: '请输入用户名',
    clearable: true
  },
  {
    label: '昵称',
    key: 'nickname',
    type: 'input',
    placeholder: '请输入昵称',
    clearable: true
  },
  {
    label: '手机号',
    key: 'phone',
    type: 'input',
    props: { placeholder: '请输入手机号', maxlength: '11' }
  },
  {
    label: '邮箱',
    key: 'email',
    type: 'input',
    props: { placeholder: '请输入邮箱' }
  },
  {
    label: '状态',
    key: 'status',
    type: 'select',
    props: {
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: true },
        { label: '停用', value: false },
      ]
    }
  },
])

// 事件
function handleReset() {
  console.log('重置表单')
  emit('reset')
}

async function handleSearch() {
  await searchBarRef.value.validate()
  emit('search', formData.value)
  console.log('表单数据', formData.value)
}
</script>
