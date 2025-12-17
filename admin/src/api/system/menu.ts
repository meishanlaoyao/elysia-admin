import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取菜单列表
export function fetchGetMenuList() {
    return request.get<AppRouteRecord[]>({
        url: '/api/system/menu/simple'
    })
}
