declare namespace Api {
    namespace SystemNotice {
        interface NoticeListItem {
            noticeId?: number;
            title?: string;
            noticeType?: string;
            content?: string;
            status?: boolean;
            sort?: number;
            createTime?: Date;
            createBy?: string;
            updateTime?: Date;
            updateBy?: string;
            delFlag?: boolean;
            remark?: string;
        }

        type NoticeList = Api.Common.PaginatedResponse<NoticeListItem>

        type NoticeSearchParams = Partial<
            Pick<NoticeListItem, 'title' | 'noticeType' | 'status'> &
            Api.Common.CommonSearchParams
        >
    }
}