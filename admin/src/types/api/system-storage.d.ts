declare namespace Api {
    namespace SystemStorage {
        interface StorageListItem {
            storageId: number;
            name: string;
            endpoint: string;
            bucket: string;
            accessKey: string;
            secretKey: string;
            region: string | null;
            stsDuration: number;
            status: boolean;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
        }

        type StorageList = Api.Common.PaginatedResponse<StorageListItem>;

        type StorageSearchParams = Partial<
            Pick<StorageListItem, 'name'> &
            Api.Common.CommonSearchParams
        >
    }
}