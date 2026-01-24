declare namespace Api {
    namespace SystemIpBlack {
        interface IpBlackItem {
            ipBlackId?: number;
            ipAddress?: string;
            status?: boolean;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
        }

        type IpBlackSearchParams = Partial<
            Pick<IpBlackItem, 'ipAddress' | 'status'>
        >
    }
}