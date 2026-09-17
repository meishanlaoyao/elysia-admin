import request from '@/utils/http'

/**
 * 执行 SQL（仅开发环境后端可用）
 */
export function fetchExecuteSql(data: Api.DevSql.ExecuteParams) {
    return request.post<Api.DevSql.ExecuteResult>({
        url: '/api/dev/sql/execute',
        data,
        showErrorMessage: true,
    })
}