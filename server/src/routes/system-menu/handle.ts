import { Context } from 'elysia';
import { eq } from 'drizzle-orm';
import { BaseResultData } from '@/common/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindAll,
    FindAllWithJoin,
} from '@/common/db';
import { ParseDateFields } from '@/common/dto';
import { systemMenuSchema, systemMenuBtnSchema } from '@/schema/system_menu';
import { listToTree } from '@/common/function';

export async function createMenu(ctx: Context) {
    try {
        const data = ctx.body as typeof systemMenuSchema.$inferInsert;
        await InsertOne(systemMenuSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function createMenuBtn(ctx: Context) {
    try {
        const data = ctx.body as typeof systemMenuBtnSchema.$inferInsert;
        await InsertOne(systemMenuBtnSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findSimple(ctx: Context) {
    try {
        const data2 = [
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
                        "path": "dept",
                        "name": "Dept",
                        "component": "/system/dept",
                        "meta": {
                            "title": "menus.system.dept",
                            "icon": "material-symbols:groups-2-outline",
                            "keepAlive": true,
                            "roles": [
                                "R_SUPER",
                                "R_ADMIN"
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
                    },
                    {
                        "path": "blacklist",
                        "name": "Blacklist",
                        "component": "/system/blacklist",
                        "meta": {
                            "title": "menus.system.blacklist",
                            "icon": "material-symbols:block-outline",
                            "keepAlive": true,
                            "roles": [
                                "R_SUPER",
                                "R_ADMIN"
                            ]
                        }
                    },
                    {
                        "path": "log",
                        "name": "Log",
                        "component": "",
                        "meta": {
                            "title": "menus.system.log",
                            "icon": "ri:file-list-3-line"
                        },
                        "children": [
                            {
                                "path": "loginLog",
                                "name": "LoginLog",
                                "component": "/system/log/loginlog",
                                "meta": {
                                    "title": "menus.system.loginLog",
                                    "icon": "ri:login-circle-line"
                                }
                            },
                            {
                                "path": "operLog",
                                "name": "OperLog",
                                "component": "/system/log/operlog",
                                "meta": {
                                    "title": "menus.system.operLog",
                                    "icon": "ri:settings-3-line"
                                }
                            }
                        ]
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
        return BaseResultData.ok(data2);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findTree(ctx: Context) {
    try {
        const {
            title,
            path,
        } = ctx.query;
        const builder = CreateQueryBuilder(systemMenuSchema)
            .eq('delFlag', false)
            .like('title', title)
            .like('path', path)
            .join({
                joinSchema: systemMenuBtnSchema,
                fieldName: 'authList',
                foreignKey: 'menuId',
                primaryKey: 'menuId',
                defaultValue: [],
                where: eq(systemMenuBtnSchema.delFlag, false),
                multiple: true
            });
        const data = await FindAllWithJoin(systemMenuSchema, builder);
        const tree = listToTree(data, {
            idKey: 'menuId',
            parentKey: 'parentId',
            childrenKey: 'children',
            rootValue: 0,
            sortKey: 'sort',
        });
        return BaseResultData.ok(tree);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateMenu(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(systemMenuSchema, 'menuId', data, true);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateMenuBtn(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(systemMenuBtnSchema, 'btnId', data, true);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeMenu(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemMenuSchema, 'menuId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeMenuBtn(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemMenuBtnSchema, 'btnId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

// 根据角色IDS获取菜单权限
export async function GetMenuPermissionByRoleIds(roleIds: number[]): Promise<string[]> {
    try {
        return [];
    }
    catch (error) {
        console.error('根据角色IDS获取菜单权限失败:', error);
        return [];
    }
};