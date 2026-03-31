declare namespace Api {
    namespace BusinessMerchant {

        interface MerchantConfigItem {
            id?: number;
            merchantId: number;
            channel: string;
            appId?: string;
            mchId?: string;
            privateKey?: string;
            publicKey?: string;
            config?: Record<string, string>;
            status?: boolean;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
            [key: string]: any;
        }

        interface MerchantListItem {
            id?: number;
            name: string;
            status?: boolean;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            configList?: MerchantConfigItem[];
            remark?: null | string;
        }

        type MerchantList = Api.Common.PaginatedResponse<MerchantListItem>

        type MerchantSearchParams = Partial<
            Pick<MerchantListItem, 'name' | 'status'> &
            Api.Common.CommonSearchParams
        >
    }
}