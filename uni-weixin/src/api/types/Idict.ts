type ElTagType = 'primary' | 'info' | 'success' | 'warning' | 'danger'

export interface FindDictDataDto {
    dictCode?: number;
    dictSort?: number;
    dictValue: string;
    dictLabel: string;
    dictType: string;
    tagType?: ElTagType;
    customClass?: string;
    status?: boolean;
    createTime?: Date;
    createBy?: null | number;
    updateTime?: null | Date;
    updateBy?: null | number;
    delFlag?: boolean;
    remark?: null | string;
}