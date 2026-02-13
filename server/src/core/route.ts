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
     * 路由管道
     */
    dto?: any
    /**
     * 路由处理函数
     */
    handle: Function
    /**
     * 路由元信息
     */
    meta?: IRouteMeta
};

export interface IRouteModule {
    /**
     * 路由模块标签
     */
    tags: string
    /**
     * 路由模块路由
     */
    routes: IRoute[]
};