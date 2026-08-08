<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加字典类型' : '编辑字典类型'"
    width="500px"
    align-center
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="formData"
      :items="formItems"
      :rules="rules"
      :span="24"
      label-width="80px"
      :show-reset="false"
      :show-submit="false"
    />
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import { fetchCreateDictType, fetchUpdateDictType } from '@/api/system/dict'

  interface Props {
    visible: boolean
    type: string
    data?: Partial<Api.SystemDict.DictTypeListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', payload?: { oldDictType: string; newDictType: string }): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)
  const loading = ref(false)
  const originalDictType = ref('')
  const formRef = ref()

  function getDefaultFormData() {
    return {
      dictId: undefined as number | undefined,
      dictName: '',
      dictType: ''
    }
  }

  const formData = reactive(getDefaultFormData())

  const formItems: FormItem[] = [
    {
      label: '字典名称',
      key: 'dictName',
      type: 'input',
      props: { placeholder: '请输入字典名称' }
    },
    {
      label: '字典类型',
      key: 'dictType',
      type: 'input',
      props: { placeholder: '请输入字典类型' }
    }
  ]

  const rules: FormRules = {
    dictName: [
      { required: true, message: '请输入字典名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    dictType: [
      { required: true, message: '请输入字典类型', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ]
  }

  const initFormData = () => {
    loading.value = false
    const isEdit = props.type === 'edit' && props.data
    const row = props.data
    Object.assign(formData, getDefaultFormData())
    if (isEdit && row) {
      originalDictType.value = row.dictType || ''
      Object.assign(formData, {
        dictId: row.dictId,
        dictName: row.dictName || '',
        dictType: row.dictType || ''
      })
    } else {
      originalDictType.value = ''
    }
  }

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

  const handleSubmit = async () => {
    if (!formRef.value) return
    formRef.value
      .validate()
      .then(async () => {
        try {
          loading.value = true
          if (dialogType.value == 'add') {
            await fetchCreateDictType({
              dictName: formData.dictName,
              dictType: formData.dictType
            })
          } else {
            await fetchUpdateDictType({
              dictId: formData.dictId,
              dictName: formData.dictName,
              dictType: formData.dictType
            })
          }
          const payload =
            dialogType.value === 'edit' &&
            originalDictType.value &&
            originalDictType.value !== formData.dictType
              ? { oldDictType: originalDictType.value, newDictType: formData.dictType }
              : undefined
          emit('submit', payload)
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
    Object.assign(formData, getDefaultFormData())
  }
</script>

<style scoped lang="scss"></style>
