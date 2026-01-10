declare namespace Api {
    namespace SystemMenu {

        interface AuthListItem {
            btnId?: number;
            menuId?: number;
            title?: string;
            sort?: number;
            permission?: string;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
        }

        interface MenuListItem {
            menuId?: number;
            path?: string;
            name?: string;
            component?: string;
            title?: string;
            icon?: null | string;
            showBadge?: boolean;
            showTextBadge?: string | null;
            isHide?: boolean;
            isHideTab?: boolean;
            link?: string | null;
            isIframe?: boolean;
            keepAlive?: boolean;
            fixedTab?: boolean;
            activePath?: string | null;
            sort?: number;
            parentId?: number | null;
            status?: boolean;
            authList?: AuthListItem[];
            children?: MenuListItem[];
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
        }

        type MenuSearchParams = Partial<
            Pick<MenuListItem, 'title' | 'path'>
        >
    }
}