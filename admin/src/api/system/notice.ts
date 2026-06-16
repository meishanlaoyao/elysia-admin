import request from '@/utils/http'

export function fetchCreateNotice(data: Api.SystemNotice.NoticeListItem) {
    return request.post({
        url: '/api/system/notice',
        data,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchGetNoticeList(params: Api.SystemNotice.NoticeSearchParams) {
    return request.get<Api.SystemNotice.NoticeList>({
        url: '/api/system/notice/list',
        params,
    })
}

export function fetchUpdateNotice(data: Api.SystemNotice.NoticeListItem) {
    return request.put({
        url: '/api/system/notice',
        data,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchDeleteNotice(ids: number | number[] | string) {
    const str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/notice/${str}`,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}
