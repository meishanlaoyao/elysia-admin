import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';

export async function findSimple(req: Context) {
    try {
        const data = [
            {
                "name": "Dashboard",
                "path": "/dashboard",
                "component": "/index/index",
                "meta": {
                    "title": "menus.dashboard.title",
                    "icon": "ri:pie-chart-line"
                },
                "children": [
                    {
                        "path": "console",
                        "name": "Console",
                        "component": "/dashboard/console",
                        "meta": {
                            "title": "menus.dashboard.console",
                            "icon": "ri:home-smile-2-line",
                            "keepAlive": false,
                            "fixedTab": true
                        }
                    }
                ]
            },
            {
                "path": "/system",
                "name": "System",
                "component": "/index/index",
                "meta": {
                    "title": "menus.system.title",
                    "icon": "ri:user-3-line"
                },
                "children": [
                    {
                        "path": "user",
                        "name": "User",
                        "component": "/system/user",
                        "meta": {
                            "title": "menus.system.user",
                            "icon": "ri:user-line",
                            "keepAlive": true,
                            "roles": [
                                "R_SUPER",
                                "R_ADMIN"
                            ]
                        }
                    },
                    {
                        "path": "role",
                        "name": "Role",
                        "component": "/system/role",
                        "meta": {
                            "title": "menus.system.role",
                            "icon": "ri:user-settings-line",
                            "keepAlive": true,
                            "roles": [
                                "R_SUPER"
                            ]
                        }
                    },
                    {
                        "path": "user-center",
                        "name": "UserCenter",
                        "component": "/system/user-center",
                        "meta": {
                            "title": "menus.system.userCenter",
                            "icon": "ri:user-line",
                            "isHide": true,
                            "keepAlive": true,
                            "isHideTab": true
                        }
                    },
                    {
                        "path": "menu",
                        "name": "Menus",
                        "component": "/system/menu",
                        "meta": {
                            "title": "menus.system.menu",
                            "icon": "ri:menu-line",
                            "keepAlive": true,
                            "roles": [
                                "R_SUPER"
                            ],
                            "authList": [
                                {
                                    "title": "新增",
                                    "authMark": "add"
                                },
                                {
                                    "title": "编辑",
                                    "authMark": "edit"
                                },
                                {
                                    "title": "删除",
                                    "authMark": "delete"
                                }
                            ]
                        }
                    },
                    {
                        "path": "dict",
                        "name": "Dict",
                        "component": "/system/dict",
                        "meta": {
                            "title": "menus.system.dict",
                            "icon": "material-symbols:book-2-outline",
                            "keepAlive": true,
                            "roles": [
                                "R_SUPER",
                                "R_ADMIN"
                            ]
                        }
                    },
                    {
                        "path": "api",
                        "name": "Api",
                        "component": "/system/api",
                        "meta": {
                            "title": "menus.system.api",
                            "icon": "tabler:api",
                            "keepAlive": true,
                            "roles": [
                                "R_SUPER",
                                "R_ADMIN"
                            ]
                        }
                    }
                ]
            },
            {
                "path": "/result",
                "name": "Result",
                "component": "/index/index",
                "meta": {
                    "title": "menus.result.title",
                    "icon": "ri:checkbox-circle-line"
                },
                "children": [
                    {
                        "path": "success",
                        "name": "ResultSuccess",
                        "component": "/result/success",
                        "meta": {
                            "title": "menus.result.success",
                            "icon": "ri:checkbox-circle-line",
                            "keepAlive": true
                        }
                    },
                    {
                        "path": "fail",
                        "name": "ResultFail",
                        "component": "/result/fail",
                        "meta": {
                            "title": "menus.result.fail",
                            "icon": "ri:close-circle-line",
                            "keepAlive": true
                        }
                    }
                ]
            },
            {
                "path": "/exception",
                "name": "Exception",
                "component": "/index/index",
                "meta": {
                    "title": "menus.exception.title",
                    "icon": "ri:error-warning-line"
                },
                "children": [
                    {
                        "path": "403",
                        "name": "403",
                        "component": "/exception/403",
                        "meta": {
                            "title": "menus.exception.forbidden",
                            "keepAlive": true,
                            "isFullPage": true
                        }
                    },
                    {
                        "path": "404",
                        "name": "404",
                        "component": "/exception/404",
                        "meta": {
                            "title": "menus.exception.notFound",
                            "keepAlive": true,
                            "isFullPage": true
                        }
                    },
                    {
                        "path": "500",
                        "name": "500",
                        "component": "/exception/500",
                        "meta": {
                            "title": "menus.exception.serverError",
                            "keepAlive": true,
                            "isFullPage": true
                        }
                    }
                ]
            }
        ];
        return BaseResultData.ok(data);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};