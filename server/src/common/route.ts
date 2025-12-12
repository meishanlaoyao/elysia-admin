export interface IRoute {
    url: string
    method: 'get' | 'post' | 'put' | 'delete'
    summary: string
    reqDto?: Function
    resDto?: Function
    handle: Function
}

export interface IRouteModule {
    tags: string
    routes: IRoute[]
}
