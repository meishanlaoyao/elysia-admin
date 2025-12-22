/**
 * API 通用类型定义
 *
 * 提供通用的分页、搜索等基础类型
 *
 * @module types/api/common
 */

declare namespace Api {
    /** 通用类型 */
    namespace Common {
        /** 分页参数 */
        interface PaginationParams {
            /** 当前页码 */
            current: number
            /** 每页条数 */
            size: number
            /** 总条数 */
            total: number
        }

        /** 通用搜索参数 */
        type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

        /** 分页响应基础结构 */
        interface PaginatedResponse<T = any> {
            records: T[]
            current: number
            size: number
            total: number
        }

        /** 启用状态 */
        type EnableStatus = '1' | '2'
    }
}
