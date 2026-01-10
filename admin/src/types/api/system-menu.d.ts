/**
 * 系统菜单 API 类型定义
 */

declare namespace Api {
    namespace SystemMenu {
        /**
         * 菜单按钮项
         */
        interface AuthListItem {
            btnId?: number
            menuId?: number
            title: string
            permission: string
            sort?: number
            status?: boolean
            createTime?: string
            updateTime?: string
        }

        /**
         * 菜单列表项
         */
        interface MenuListItem {
            menuId?: number | string
            btnId?: number
            path?: string
            name?: string
            component?: string
            title: string
            icon?: string
            showBadge?: boolean
            showTextBadge?: string
            isHide?: boolean
            isHideTab?: boolean
            link?: string
            isIframe?: boolean
            keepAlive?: boolean
            fixedTab?: boolean
            isFullPage?: boolean
            activePath?: string
            sort?: number
            status?: boolean
            parentId?: number
            authList?: AuthListItem[]
            children?: MenuListItem[]
            createTime?: string
            updateTime?: string
            // 用于前端展示的扩展字段
            isAuthButton?: boolean
            permission?: string
            parentMenuId?: number | string
        }

        /**
         * 菜单搜索参数
         */
        interface MenuSearchParams {
            title?: string
            path?: string
        }
    }
}
