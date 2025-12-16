import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';

export async function findList(req: Context) {
    try {
        const list = [
            {
                "roleId": 1,
                "roleName": "超级管理员",
                "roleCode": "R_DATA",
                "description": "拥有系统全部权限",
                "enabled": true,
                "createTime": "1983-08-02 11:04:41"
            },
            {
                "roleId": 2,
                "roleName": "财务",
                "roleCode": "R_GUEST",
                "description": "管理营销活动权限",
                "enabled": true,
                "createTime": "2015-07-22 21:08:27"
            },
            {
                "roleId": 3,
                "roleName": "运维",
                "roleCode": "R_OPS",
                "description": "拥有系统管理权限",
                "enabled": true,
                "createTime": "1973-06-15 13:58:13"
            },
            {
                "roleId": 4,
                "roleName": "财务",
                "roleCode": "R_PM",
                "description": "拥有数据分析权限",
                "enabled": false,
                "createTime": "2014-10-16 21:14:55"
            },
            {
                "roleId": 5,
                "roleName": "普通用户",
                "roleCode": "R_USER",
                "description": "仅限浏览权限",
                "enabled": true,
                "createTime": "2011-09-25 17:31:46"
            },
            {
                "roleId": 6,
                "roleName": "财务",
                "roleCode": "R_TEST",
                "description": "拥有系统普通权限",
                "enabled": true,
                "createTime": "1990-09-16 15:16:11"
            },
            {
                "roleId": 7,
                "roleName": "普通用户",
                "roleCode": "R_FINANCE",
                "description": "拥有数据分析权限",
                "enabled": true,
                "createTime": "2008-09-06 10:59:13"
            },
            {
                "roleId": 8,
                "roleName": "数据分析师",
                "roleCode": "R_TEST",
                "description": "负责系统维护和更新",
                "enabled": true,
                "createTime": "1984-09-15 04:20:59"
            },
            {
                "roleId": 9,
                "roleName": "数据分析师",
                "roleCode": "R_USER",
                "description": "管理营销活动权限",
                "enabled": false,
                "createTime": "1972-02-25 21:50:10"
            },
            {
                "roleId": 10,
                "roleName": "项目经理",
                "roleCode": "R_OPS",
                "description": "拥有数据分析权限",
                "enabled": true,
                "createTime": "1999-12-30 21:50:04"
            },
            {
                "roleId": 11,
                "roleName": "客服",
                "roleCode": "R_USER",
                "description": "管理营销活动权限",
                "enabled": true,
                "createTime": "1995-06-04 11:33:32"
            },
            {
                "roleId": 12,
                "roleName": "运维",
                "roleCode": "R_DATA",
                "description": "管理财务相关权限",
                "enabled": true,
                "createTime": "1982-06-13 23:45:30"
            },
            {
                "roleId": 13,
                "roleName": "系统管理员",
                "roleCode": "R_USER",
                "description": "处理客户支持请求",
                "enabled": true,
                "createTime": "2024-07-27 18:19:14"
            },
            {
                "roleId": 14,
                "roleName": "普通用户",
                "roleCode": "R_TEST",
                "description": "负责系统维护和更新",
                "enabled": false,
                "createTime": "1990-01-23 23:49:00"
            },
            {
                "roleId": 15,
                "roleName": "数据分析师",
                "roleCode": "R_SUPPORT",
                "description": "拥有系统普通权限",
                "enabled": true,
                "createTime": "1973-03-10 20:11:37"
            },
            {
                "roleId": 16,
                "roleName": "财务",
                "roleCode": "R_FINANCE",
                "description": "拥有系统管理权限",
                "enabled": false,
                "createTime": "2010-06-07 09:35:47"
            },
            {
                "roleId": 17,
                "roleName": "普通用户",
                "roleCode": "R_ADMIN",
                "description": "管理财务相关权限",
                "enabled": false,
                "createTime": "2007-01-25 01:38:15"
            },
            {
                "roleId": 18,
                "roleName": "数据分析师",
                "roleCode": "R_TEST",
                "description": "负责系统维护和更新",
                "enabled": false,
                "createTime": "1987-06-13 23:21:27"
            },
            {
                "roleId": 19,
                "roleName": "运维",
                "roleCode": "R_USER",
                "description": "仅限浏览权限",
                "enabled": true,
                "createTime": "2022-05-29 23:37:31"
            },
            {
                "roleId": 20,
                "roleName": "普通用户",
                "roleCode": "R_GUEST",
                "description": "处理客户支持请求",
                "enabled": false,
                "createTime": "2017-01-18 19:10:18"
            }
        ];
        return BaseResultData.ok({ list, total: list.length });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};