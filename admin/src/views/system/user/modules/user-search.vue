<template>
  <div class="user-search">
    <ArtSearchBar
      ref="searchBarRef"
      v-model="formData"
      :items="formItems"
      :rules="rules"
      @reset="handleReset"
      @search="handleSearch"
    />
  </div>
</template>

<script setup lang="ts">
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

const searchBarRef = ref()
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const rules = {}

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
        { label: '停用', value: false }
      ]
    }
  }
])

function handleReset() {
  emit('reset')
}

async function handleSearch() {
  await searchBarRef.value.validate()
  emit('search', formData.value)
}
</script>

<style scoped lang="scss">
.user-search {
  :deep(.art-search-bar),
  :deep(.el-card) {
    transition:
      border-color 0.25s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }

  :deep(.el-form-item__label) {
    color: var(--art-gray-600);
    font-weight: 500;
  }
}
</style>
