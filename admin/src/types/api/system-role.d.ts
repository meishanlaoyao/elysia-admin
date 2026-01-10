declare namespace Api {
    namespace SystemRole {
        /** 角色列表 */
        type RoleList = Api.Common.PaginatedResponse<RoleListItem>

        /** 角色列表项 */
        interface RoleListItem {
            roleId?: number;
            roleName?: string;
            roleCode?: string;
            sort?: number;
            status?: boolean;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
        }

        /** 角色权限项 */
        interface RolePermission {
            roleId?: number;
            menuId?: number;
            menuBtnId?: number; // 按钮ID（可选，有值表示按钮权限）
        }

        /** 更新角色权限参数 */
        interface UpdateRolePermissionParams {
            roleId: number;
            permissions: Array<{
                menuId: number;
                menuBtnId?: number; // 按钮ID（可选）
            }>;
        }

        /** 角色搜索参数 */
        type RoleSearchParams = Partial<
            Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
            Api.Common.CommonSearchParams
        >
    }
}