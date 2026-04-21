<template>
  <div class="menu-page art-full-height">
    <MenuSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader :showZebra="false" :loading="loading" v-model:columns="columnChecks" @refresh="getData">
        <template #left>
          <ElButton v-auth="'system:menu:create'" @click="showDialog('add')" v-ripple>添加菜单</ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable ref="tableRef" rowKey="menuId" :loading="loading" :columns="columns" :data="processedTableData"
        :stripe="false" :tree-props="{ children: 'children' }" :default-expand-all="false" />

      <MenuDialog v-model:visible="dialogVisible" :type="menuDialogType" :editData="currentMenuData"
        :lockType="lockMenuType" @submit="handleSubmit" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { ElTag, ElMessageBox } from 'element-plus'
import { useTableColumns } from '@/hooks/core/useTableColumns'
import { formatMenuTitle } from '@/utils/router'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import MenuSearch from './modules/menu-search.vue'
import MenuDialog from './modules/menu-dialog.vue'
import {
  fetchGetMenuTree,
  fetchCreateMenu,
  fetchUpdateMenu,
  fetchDeleteMenu,
  fetchCreateMenuBtn,
  fetchUpdateMenuBtn,
  fetchDeleteMenuBtn
} from '@/api/system/menu'

defineOptions({ name: 'Menus' })

type MenuListItem = Api.SystemMenu.MenuListItem
const auth = useAuth()

// 弹窗相关
const dialogType = ref<'add' | 'edit'>('add')
const dialogVisible = ref(false)
const currentMenuData = ref<Partial<MenuListItem>>({})
const lockMenuType = ref(false)
const menuDialogType = ref<'menu' | 'button'>('menu')

// 状态管理
const loading = ref(false)
const isExpanded = ref(false)
const tableRef = ref()

// 数据相关
const tableData = ref<MenuListItem[]>([])

// 搜索表单
const searchForm = ref({
  title: undefined,
  path: undefined
})

/**
 * 判断是否为目录（有真实子菜单，而非仅有权限按钮）
 */
const hasRealChildren = (row: MenuListItem): boolean => {
  return !!row.children?.some((child) => !child.isAuthButton)
}

/**
 * 获取菜单类型标签颜色
 */
const getMenuTypeTag = (row: MenuListItem): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  if (row.isAuthButton) return 'danger'
  if (hasRealChildren(row)) return 'info'
  if (row.link && row.isIframe) return 'success'
  if (row.link) return 'warning'
  if (row.path) return 'primary'
  return 'info'
}

/**
 * 获取菜单类型文本
 */
const getMenuTypeText = (row: MenuListItem): string => {
  if (row.isAuthButton) return '按钮'
  if (hasRealChildren(row)) return '目录'
  if (row.link && row.isIframe) return '内嵌'
  if (row.link) return '外链'
  if (row.path) return '菜单'
  return '未知'
}

// 表格列配置
const { columnChecks, columns } = useTableColumns(() => [
  {
    prop: 'title',
    label: '菜单名称',
    minWidth: 120,
    formatter: (row: MenuListItem) => formatMenuTitle(row.title)
  },
  {
    prop: 'type',
    label: '菜单类型',
    formatter: (row: MenuListItem) => {
      return h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row))
    }
  },
  {
    prop: 'path',
    label: '路由',
    formatter: (row: MenuListItem) => {
      if (row.isAuthButton) return ''
      return row.link || row.path || ''
    }
  },
  {
    prop: 'authList',
    label: '权限标识',
    formatter: (row: MenuListItem) => {
      if (row.isAuthButton) {
        return row.permission || ''
      }
      if (!row.authList?.length) return ''
      return `${row.authList.length} 个权限标识`
    }
  },
  {
    prop: 'updateTime',
    label: '编辑时间',
    formatter: (row: MenuListItem) => {
      const time = row.updateTime || row.createTime
      if (!time) return '-'
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  {
    prop: 'status',
    label: '状态',
    formatter: (row: MenuListItem) => {
      return h(ElTag, { type: row.status ? 'success' : 'danger' }, () => row.status ? '启用' : '禁用')
    }
  },
  {
    prop: 'operation',
    label: '操作',
    width: 180,
    fixed: 'right',
    formatter: (row: MenuListItem) => {
      const hasAdd = auth.hasAuth('system:menu:create')
      const hasEdit = auth.hasAuth('system:menu:update')
      const hasDelete = auth.hasAuth('system:menu:delete')
      if (row.isAuthButton) {
        const buttons = []
        if (hasEdit) {
          buttons.push(
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => showDialog('edit', row, 'button')
            })
          )
        }
        if (hasDelete) {
          buttons.push(
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => handleDeleteAuth(row)
            })
          )
        }
        return h('div', {}, buttons)
      }
      const buttons = [];
      if (hasAdd) {
        buttons.push(
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => showDialog('add', { parentMenuId: row.menuId, parentMenuTitle: row.title }),
          })
        )
      }
      if (hasEdit) {
        buttons.push(
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => showDialog('edit', row, 'menu')
          })
        )
      }
      if (hasDelete) {
        buttons.push(
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteMenu(row)
          })
        )
      }
      return h('div', {}, buttons)
    }
  }
])

/**
 * 深度克隆对象
 */
const deepClone = <T,>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj) as T
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 将权限列表转换为子节点
 */
const convertAuthListToChildren = (items: MenuListItem[]): MenuListItem[] => {
  const result: MenuListItem[] = []

  items.forEach((item) => {
    const clonedItem = deepClone(item)

    // 清理空的 children 数组
    if (clonedItem.children?.length === 0) {
      delete clonedItem.children
    }

    // 递归处理真正的子菜单
    if (clonedItem.children?.length) {
      clonedItem.children = convertAuthListToChildren(clonedItem.children)
    }

    result.push(clonedItem)

    // 将权限按钮作为子节点添加
    if (item.authList?.length) {
      const authChildren: MenuListItem[] = item.authList.map((auth) => ({
        // 保持 btnId 为 number 类型，用于编辑和删除
        btnId: auth.btnId,
        // menuId 使用字符串格式避免和真实菜单 ID 冲突（仅用于 rowKey）
        menuId: `btn_${auth.btnId}` as any,
        title: auth.title,
        permission: auth.permission,
        isAuthButton: true,
        parentMenuId: item.menuId,
        sort: auth.sort,
        status: auth.status,
        createTime: auth.createTime,
        updateTime: auth.updateTime
      }))

      if (clonedItem.children?.length) {
        clonedItem.children.push(...authChildren)
      } else {
        clonedItem.children = authChildren
      }
    }
  })

  return result
}

/**
 * 处理后的表格数据
 */
const processedTableData = computed(() => {
  const data = convertAuthListToChildren(tableData.value)
  // 最后清理：确保权限按钮没有 children
  const cleanChildren = (items: MenuListItem[]) => {
    items.forEach(item => {
      if (item.isAuthButton && item.children !== undefined) {
        delete item.children
      }
      if (item.children?.length) {
        cleanChildren(item.children)
      }
    })
  }
  cleanChildren(data)
  return data
})

/**
 * 获取菜单数据
 */
const getData = async (): Promise<void> => {
  loading.value = true
  try {
    const list = await fetchGetMenuTree(searchForm.value)
    tableData.value = list
  } catch (error) {
    ElMessage.error('获取菜单失败')
    throw error instanceof Error ? error : new Error('获取菜单失败')
  } finally {
    loading.value = false
  }
}

/**
 * 显示弹窗
 */
const showDialog = (type: 'add' | 'edit', row?: any, menuType?: 'menu' | 'button'): void => {
  dialogType.value = type
  currentMenuData.value = row || {}

  // 设置菜单对话框类型
  if (menuType) {
    menuDialogType.value = menuType
  } else {
    menuDialogType.value = 'menu'
  }

  // 如果是添加菜单（从顶部按钮点击），锁定为菜单类型
  if (type === 'add' && !row?.parentMenuId) {
    lockMenuType.value = true
  } else {
    lockMenuType.value = false
  }

  nextTick(() => {
    dialogVisible.value = true
  })
}

/**
 * 提交表单数据
 */
const handleSubmit = async (formData: any): Promise<void> => {
  try {
    if (formData.menuType === 'menu') {
      // 菜单操作
      const menuData: MenuListItem = {
        menuId: formData.menuId,
        title: formData.title,
        path: formData.path,
        name: formData.name,
        component: formData.component,
        icon: formData.icon,
        sort: formData.sort,
        status: formData.status,
        keepAlive: formData.keepAlive,
        isHide: formData.isHide,
        isHideTab: formData.isHideTab,
        link: formData.link,
        isIframe: formData.isIframe,
        showBadge: formData.showBadge,
        showTextBadge: formData.showTextBadge,
        fixedTab: formData.fixedTab,
        activePath: formData.activePath,
        parentId: formData.parentId || 0
      }
      if (formData.menuId) {
        await fetchUpdateMenu(menuData)
      } else {
        await fetchCreateMenu(menuData)
      }
    } else {
      // 按钮操作
      const btnData: Api.SystemMenu.AuthListItem = {
        btnId: formData.btnId,
        menuId: formData.menuId,
        title: formData.title,
        permission: formData.permission,
        sort: formData.sort,
        status: formData.status
      }
      console.log('提交按钮数据:', btnData, 'formData:', formData)
      if (formData.btnId) {
        await fetchUpdateMenuBtn(btnData)
      } else {
        await fetchCreateMenuBtn(btnData)
      }
    }
    getData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

/**
 * 删除菜单
 */
const handleDeleteMenu = async (row: MenuListItem): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (row.menuId && typeof row.menuId === 'number') {
      await fetchDeleteMenu(row.menuId)
      ElMessage.success('删除成功')
      getData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

/**
 * 删除权限按钮
 */
const handleDeleteAuth = async (row: MenuListItem): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (row.btnId) {
      await fetchDeleteMenuBtn(row.btnId)
      ElMessage.success('删除成功')
      getData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

/**
 * 切换展开/收起所有菜单
 */
const toggleExpand = (): void => {
  isExpanded.value = !isExpanded.value
  nextTick(() => {
    if (tableRef.value?.elTableRef && processedTableData.value) {
      const processRows = (rows: MenuListItem[]) => {
        rows.forEach((row) => {
          if (row.children?.length) {
            tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
            processRows(row.children)
          }
        })
      }
      processRows(processedTableData.value)
    }
  })
}

/**
 * 搜索处理
 */
const handleSearch = (params: Record<string, any>) => {
  Object.assign(searchForm.value, params)
  getData()
}

/**
 * 重置处理
 */
const handleReset = () => {
  searchForm.value = {
    title: undefined,
    path: undefined
  }
  getData()
}

onMounted(() => {
  getData()
})
</script>

<style scoped lang='scss'></style>
