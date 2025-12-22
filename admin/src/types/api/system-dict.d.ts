declare namespace Api {
    namespace SystemDict {
        /** 创建-类型 */
        interface CreateDictType {
            dictName: string
            dictType: string
        }

        /** 创建-数据​ */
        interface CreateDictData {
            dictValue: string
            dictType: string
            dictLabel: string
            dictSort: number
        }

        interface DictTypeListItem {
            dictId: number;
            dictName: string;
            dictType: string;
            status: boolean;
            createTime: Date;
            createBy: null | number;
            updateTime: null | Date;
            updateBy: null | number;
            delFlag: boolean;
            remark: null | string;
        }

        interface DictDataListItem {
            dictCode: number;
            dictSort: number;
            dictValue: string;
            dictLabel: string;
            dictType: string;
            status: boolean;
            createTime: Date;
            createBy: null | number;
            updateTime: null | Date;
            updateBy: null | number;
            delFlag: boolean;
            remark: null | string;
        }

        /** 字典-类型列表 */
        type DictTypeList = Api.Common.PaginatedResponse<DictTypeListItem>

        /** 字典-数据列表 */
        type DictDataList = Api.Common.PaginatedResponse<DictDataListItem>

        type DictDataSearchParams = Partial<
            Pick<DictDataListItem, 'dictType' | 'dictLabel'> &
            Api.Common.CommonSearchParams
        >

        /** 字典-类型搜索参数 */
        type DictTypeSearchParams = Partial<
            Pick<DictTypeListItem, 'dictName' | 'dictType'> &
            Api.Common.CommonSearchParams
        >
    }
}