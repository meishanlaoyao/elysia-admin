export interface IRoute {
    url: string
    method: 'get' | 'post' | 'put' | 'delete'
    summary: string
    dto?: any
    handle: Function
}

export interface IRouteModule {
    tags: string
    routes: IRoute[]
}
