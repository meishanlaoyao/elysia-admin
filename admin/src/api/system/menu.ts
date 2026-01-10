import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

/**
 * 获取菜单列表（用于路由生成）
 */
export function fetchGetMenuList() {
    return request.get<AppRouteRecord[]>({
        url: '/api/system/menu/simple'
    })
}

/**
 * 获取菜单树（用于菜单管理页面）
 */
export function fetchGetMenuTree(params?: Api.SystemMenu.MenuSearchParams) {
    return request.get<Api.SystemMenu.MenuListItem[]>({
        url: '/api/system/menu/tree',
        params
    })
}

/**
 * 创建菜单
 */
export function fetchCreateMenu(data: Api.SystemMenu.MenuListItem) {
    return request.post({
        url: '/api/system/menu',
        data
    })
}

/**
 * 更新菜单
 */
export function fetchUpdateMenu(data: Api.SystemMenu.MenuListItem) {
    return request.put({
        url: '/api/system/menu',
        data
    })
}

/**
 * 删除菜单
 */
export function fetchDeleteMenu(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/menu/${str}`
    })
}

/**
 * 创建按钮
 */
export function fetchCreateMenuBtn(data: Api.SystemMenu.AuthListItem) {
    return request.post({
        url: '/api/system/menu/btn',
        data
    })
}

/**
 * 更新按钮
 */
export function fetchUpdateMenuBtn(data: Api.SystemMenu.AuthListItem) {
    return request.put({
        url: '/api/system/menu/btn',
        data
    })
}

/**
 * 删除按钮
 */
export function fetchDeleteMenuBtn(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/menu/btn/${str}`
    })
}