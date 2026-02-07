<template>
  <ElDialog v-model="visible" title="菜单权限" width="520px" align-center class="el-dialog-border" @close="handleClose">
    <ElScrollbar height="70vh">
      <ElTree ref="treeRef" :data="menuTreeData" show-checkbox check-strictly node-key="menuId"
        :default-expand-all="isExpandAll" :props="defaultProps" @check="handleTreeCheck">
        <template #default="{ data }">
          <span>{{ formatMenuTitle(data.title) }}</span>
        </template>
      </ElTree>
    </ElScrollbar>
    <template #footer>
      <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
      <ElButton @click="toggleSelectAll">{{ isSelectAll ? '取消全选' : '全部选择' }}</ElButton>
      <ElButton type="primary" :loading="loading" @click="savePermission">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { formatMenuTitle } from '@/utils/router'
import { fetchGetMenuTree } from '@/api/system/menu'
import { fetchGetRolePermission, fetchUpdateRolePermission } from '@/api/system/role'

type RoleListItem = Api.SystemRole.RoleListItem
type MenuListItem = Api.SystemMenu.MenuListItem

interface Props {
  modelValue: boolean
  roleData?: RoleListItem
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  roleData: undefined
})

const emit = defineEmits<Emits>()

const treeRef = ref()
const isExpandAll = ref(true)
const isSelectAll = ref(false)
const loading = ref(false)
const menuTreeData = ref<MenuListItem[]>([])

/**
 * 弹窗显示状态双向绑定
 */
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/**
 * 树形组件配置
 */
const defaultProps = {
  children: 'children',
  label: 'title'
}

/**
 * 将 authList 转换为树节点的 children
 */
const convertAuthListToChildren = (menuList: MenuListItem[]): MenuListItem[] => {
  return menuList.map(menu => {
    const newMenu = { ...menu }

    // 如果有 authList，将其转换为 children
    if (menu.authList && menu.authList.length > 0) {
      const authChildren = menu.authList.map(auth => ({
        menuId: `btn_${auth.btnId}`, // 使用前缀避免与 menuId 冲突
        btnId: auth.btnId, // 保留原始 btnId 用于提交
        title: auth.title,
        isAuthButton: true,
        permission: auth.permission,
        parentMenuId: menu.menuId
      } as MenuListItem))

      // 合并原有 children 和 authList 转换的 children
      newMenu.children = menu.children ? [...menu.children, ...authChildren] : authChildren
    }

    // 递归处理子菜单
    if (newMenu.children && newMenu.children.length > 0) {
      newMenu.children = convertAuthListToChildren(newMenu.children)
    }

    return newMenu
  })
}

/**
 * 加载菜单树数据
 */
const loadMenuTree = async () => {
  try {
    const data = await fetchGetMenuTree()
    menuTreeData.value = convertAuthListToChildren(data || [])
  } catch (error) {
    console.error('加载菜单树失败:', error)
    ElMessage.error('加载菜单树失败')
  }
}

/**
 * 加载角色权限数据
 */
const loadRolePermission = async () => {
  if (!props.roleData?.roleId) return

  try {
    const data = await fetchGetRolePermission(props.roleData.roleId)

    // 根据 menuBtnId 字段构建选中的 keys
    // menuBtnId 为 null 表示菜单权限，直接使用 menuId
    // menuBtnId 有值表示按钮权限，使用 btn_${menuBtnId} 格式
    const checkedKeys = data?.map((item: Api.SystemRole.RolePermission) => {
      if (item.menuBtnId) {
        // 按钮权限
        return `btn_${item.menuBtnId}`
      } else {
        // 菜单权限
        return item.menuId
      }
    }).filter(Boolean) as (number | string)[]

    // 设置选中的节点，使用 checkStrictly 模式避免父子关联
    nextTick(() => {
      if (treeRef.value) {
        treeRef.value.setCheckedKeys(checkedKeys, false)
      }
    })
  } catch (error) {
    console.error('加载角色权限失败:', error)
    ElMessage.error('加载角色权限失败')
  }
}

/**
 * 监听弹窗打开，初始化权限数据
 */
watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      await loadMenuTree()
      await loadRolePermission()
    }
  }
)

/**
 * 关闭弹窗并清空选中状态
 */
const handleClose = () => {
  visible.value = false
  treeRef.value?.setCheckedKeys([])
  isSelectAll.value = false
}

/**
 * 保存权限配置
 */
const savePermission = async () => {
  if (!props.roleData?.roleId) {
    ElMessage.error('角色信息不存在')
    return
  }

  try {
    loading.value = true
    const tree = treeRef.value
    if (!tree) return

    // 使用 check-strictly 模式后，只需要获取选中的节点，不需要半选中节点
    const checkedKeys = tree.getCheckedKeys() as (number | string)[]

    // 构建权限数组，区分菜单和按钮
    const permissions: Array<{ menuId: number; menuBtnId?: number }> = []

    // 用于记录已处理的菜单ID，避免重复
    const processedMenuIds = new Set<number>()

    checkedKeys.forEach(key => {
      if (typeof key === 'string' && key.startsWith('btn_')) {
        // 按钮权限：需要找到对应的菜单ID
        const btnId = parseInt(key.replace('btn_', ''))
        if (!isNaN(btnId)) {
          // 从树数据中找到这个按钮对应的菜单ID
          const findMenuIdForBtn = (nodes: MenuListItem[]): number | null => {
            for (const node of nodes) {
              if (node.children) {
                for (const child of node.children) {
                  if (child.isAuthButton && child.btnId === btnId) {
                    return node.menuId as number
                  }
                }
                const found = findMenuIdForBtn(node.children)
                if (found) return found
              }
            }
            return null
          }

          const menuId = findMenuIdForBtn(menuTreeData.value)
          if (menuId) {
            permissions.push({ menuId, menuBtnId: btnId })
          }
        }
      } else if (typeof key === 'number') {
        // 菜单权限
        if (!processedMenuIds.has(key)) {
          permissions.push({ menuId: key })
          processedMenuIds.add(key)
        }
      }
    })
    await fetchUpdateRolePermission({
      roleId: props.roleData.roleId,
      permissions
    })
    emit('success')
    handleClose()
  } finally {
    loading.value = false
  }
}

/**
 * 切换全部展开/收起状态
 */
const toggleExpandAll = () => {
  const tree = treeRef.value
  if (!tree) return

  const nodes = tree.store.nodesMap
  Object.values(nodes).forEach((node: any) => {
    node.expanded = !isExpandAll.value
  })

  isExpandAll.value = !isExpandAll.value
}

/**
 * 递归获取所有节点的 menuId（包括权限按钮的 btn_xxx 格式）
 */
const getAllNodeKeys = (nodes: MenuListItem[]): (number | string)[] => {
  const keys: (number | string)[] = []
  const traverse = (nodeList: MenuListItem[]): void => {
    nodeList.forEach((node) => {
      if (node.menuId !== undefined && node.menuId !== null) {
        keys.push(node.menuId)
      }
      if (node.children?.length) traverse(node.children)
    })
  }
  traverse(nodes)
  return keys
}

/**
 * 切换全选/取消全选状态
 */
const toggleSelectAll = () => {
  const tree = treeRef.value
  if (!tree) return

  const shouldSelectAll = !isSelectAll.value

  if (shouldSelectAll) {
    const allKeys = getAllNodeKeys(menuTreeData.value)
    tree.setCheckedKeys(allKeys)
    isSelectAll.value = true
  } else {
    tree.setCheckedKeys([])
    isSelectAll.value = false
  }
}

/**
 * 处理树节点选中状态变化
 */
const handleTreeCheck = () => {
  const tree = treeRef.value
  if (!tree) return

  const checkedKeys = tree.getCheckedKeys()
  const allKeys = getAllNodeKeys(menuTreeData.value)

  isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
}
</script>
