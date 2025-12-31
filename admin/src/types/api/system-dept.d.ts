declare namespace Api {
    namespace SystemDept {
        interface DeptListItem {
            deptId?: number;
            deptName?: string;
            status?: boolean;
            parentId?: number;
            sort?: number;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: number | null;
            delFlag?: boolean;
            remark?: string | null;
            children?: DeptListItem[];
        }

        type DeptSearchParams = Partial<
            Pick<DeptListItem, 'deptName'> &
            Api.Common.CommonSearchParams
        >
    }
}