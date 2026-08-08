<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加字典数据' : '编辑字典数据'"
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
      label-width="100px"
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
  import { fetchCreateDictData, fetchUpdateDictData } from '@/api/system/dict'

  type DictDataListItem = Api.SystemDict.DictDataListItem
  type DictTypeListItem = Api.SystemDict.DictTypeListItem

  interface Props {
    visible: boolean
    type: string
    data?: Partial<DictDataListItem>
    dictTypeList: DictTypeListItem[]
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

  const dialogType = computed(() => props.type)
  const loading = ref(false)

  const tagTypeOptions = [
    { label: 'Primary', value: 'primary' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Info', value: 'info' },
    { label: 'Danger', value: 'danger' }
  ]

  const formRef = ref()

  const formData = reactive({
    dictCode: undefined as number | undefined,
    dictLabel: '',
    dictType: '',
    dictValue: '',
    dictSort: 0,
    remark: '',
    tagType: '',
    customClass: ''
  })

  function getDefaultFormData(dictType = '') {
    return {
      dictCode: undefined as number | undefined,
      dictLabel: '',
      dictType,
      dictValue: '',
      dictSort: 0,
      remark: '',
      tagType: '',
      customClass: ''
    }
  }

  const dictTypeOptions = computed(() => {
    return props.dictTypeList.map((item) => ({
      label: item.dictName,
      value: item.dictType || ''
    }))
  })

  const formItems = computed<FormItem[]>(() => [
    {
      label: '字典类型',
      key: 'dictType',
      type: 'select',
      props: {
        placeholder: '请选择字典类型',
        options: dictTypeOptions.value
      }
    },
    {
      label: '字典标签',
      key: 'dictLabel',
      type: 'input',
      props: { placeholder: '请输入字典标签' }
    },
    {
      label: '字典值',
      key: 'dictValue',
      type: 'input',
      props: { placeholder: '请输入字典值' }
    },
    {
      label: '标签类型',
      key: 'tagType',
      type: 'select',
      props: {
        placeholder: '请选择标签类型',
        options: tagTypeOptions
      }
    },
    {
      label: '自定义样式',
      key: 'customClass',
      type: 'input',
      props: { placeholder: '请输入自定义class' }
    },
    {
      label: '字典排序',
      key: 'dictSort',
      type: 'number',
      props: { min: 0, controlsPosition: 'right', style: { width: '100%' } }
    },
    {
      label: '备注',
      key: 'remark',
      type: 'input',
      props: { type: 'textarea', rows: 4, placeholder: '请输入备注' }
    }
  ])

  const rules: FormRules = {
    dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
    dictType: [{ required: true, message: '请选择字典类型', trigger: 'change' }],
    dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
  }

  const initFormData = () => {
    loading.value = false
    const isEdit = props.type === 'edit' && props.data
    const row = props.data
    Object.assign(formData, getDefaultFormData(row?.dictType || ''))
    if (isEdit && row) {
      Object.assign(formData, {
        ...getDefaultFormData(row.dictType || ''),
        dictCode: row.dictCode,
        dictLabel: row.dictLabel || '',
        dictType: row.dictType || '',
        dictValue: row.dictValue || '',
        dictSort: row.dictSort || 0,
        remark: row.remark || '',
        tagType: row.tagType || '',
        customClass: row.customClass || ''
      })
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
            await fetchCreateDictData(formData as DictDataListItem)
          } else {
            await fetchUpdateDictData(formData as DictDataListItem)
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
    Object.assign(formData, getDefaultFormData())
  }
</script>

<style scoped lang="scss"></style>
