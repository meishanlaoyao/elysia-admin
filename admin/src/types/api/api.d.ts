/**
 * API 接口类型定义模块（主入口）
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * ## 模块结构
 *
 * - common.d.ts - 通用类型（分页、搜索等）
 * - auth.d.ts - 认证类型（登录、用户信息等）
 * - system-manage.d.ts - 系统管理类型（用户、角色等）
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

/// <reference path="./common.d.ts" />
/// <reference path="./auth.d.ts" />
/// <reference path="./system-manage.d.ts" />
