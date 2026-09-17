import type { Context } from 'elysia';
import type { IRequestMethod } from '@/types/common';

export interface IRouteMeta {
    /** 
     * 权限标识
     */
    permission?: string
    /**
     * 是否需要认证 默认false
     */
    isAuth?: boolean
    /**
     * 是否记录操作日志 默认false
     */
    isLog?: boolean
    /**
     * ip限流 时间范围内(单位秒):请求次数 如: 10:100 表示10秒内最多100次请求
     */
    ipRateLimit?: string
};

export interface IRoute {
    /**
     * 路由路径
     */
    url: string
    /**
     * 请求方法
     */
    method: IRequestMethod
    /**
     * 路由描述
     */
    summary: string
    /**
     * 路由管道（Elysia 本地 hook：body/query/response/afterHandle 等）
     */
    dto?: Record<string, unknown>
    /**
     * 路由处理函数
     */
    handle: (ctx: Context) => unknown | Promise<unknown>
    /**
     * 路由元信息
     */
    meta?: IRouteMeta
};

/** 路由模块支持的环境阶段 */
export type RouteStage = 'development' | 'production';

export interface IRouteModule {
    /**
     * 路由模块标签
     */
    tags: string
    /**
     * 支持的环境阶段。缺省为 development + production（两端都注册/打包）。
     * 必须使用字面量数组（如 `stages: ['development']`），供构建脚本正则解析；勿用变量或计算值。
     * `stages: []` 表示永不加载。生产构建仅收录含 `production` 的模块。
     */
    stages?: RouteStage[]
    /**
     * 路由模块路由
     */
    routes: IRoute[]
};