# 第一个接口

接下来详细介绍如何在 `Elysia Admin` 项目中创建第一个 API 接口，包括接口定义、参数校验、响应处理等完整流程。

## 一、创建业务模块

首先，在 `/server/src/modules/` 目录下创建业务模块目录，例如： `/server/src/modules/business-goods/`。

**命名规范：**
- `business` 作为业务模块的前缀，用于区分不同类型的模块
- `goods` 作为业务模块的具体名称，描述模块的业务领域

## 二、定义接口路由

在 `/server/src/modules/business-goods/` 目录下创建 `route.ts` 文件，用于定义接口路由配置。

```ts
import type { IRouteModule } from "@/types/route";

const BusinessGoodsModule: IRouteModule = {
    // 业务模块分类名称（用于 API 文档分组）
    tags: '商品管理',
    // 接口列表
    routes: [
        {
            url: '/business/goods', // 接口路径
            method: 'post', // 接口 HTTP 方法
            summary: '创建商品', // 接口描述（将显示在 API 文档中）
            handle: () => {}, // 接口处理函数（暂时为空实现）
            // 接口元数据配置
            meta: { 
                isAuth: true, // 是否需要登录认证
                isLog: true, // 是否记录操作日志
                ipRateLimit: '60:2', // IP 限流配置（60秒内最多2次请求）
                permission: 'business:goods:create', // 权限配置
            },
        }
    ],
};

export default BusinessGoodsModule;
```

保存文件后，接口会自动注册到后端服务中。在开发环境下，API 文档也会实时更新。

## 三、创建数据传输对象 (DTO)

`DTO`（Data Transfer Object）用于校验前端传递的参数是否符合要求，以及确保后端响应的数据类型正确。若参数或响应数据不符合定义，系统会自动返回错误响应。

在 `/server/src/modules/business-goods/` 目录下创建 `dto.ts` 文件：

```ts
import { t } from 'elysia';
import { BaseResultDto } from '@/types/dto';

/**
 * 创建商品请求参数校验
 */
export const CreateDto = {
    body: t.Object({
        name: t.String({ description: '商品名称', error: '商品名称格式错误', minLength: 5 }),
        price: t.Number({ description: '商品价格', error: '商品价格格式错误', min: 0 }),
        stock: t.Number({ description: '商品库存', error: '商品库存格式错误', min: 0 }),
        remark: t.Optional(t.String({ description: '商品备注' })),
    }),
};
```

## 四、实现接口处理函数

在 `/server/src/modules/business-goods/` 目录下创建 `handle.ts` 文件，用于实现接口的业务逻辑：

```ts
import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';

/**
 * 创建商品接口处理函数
 * @param ctx Elysia 上下文对象
 * @returns 标准响应格式
 */
export async function create(ctx: Context) {
    try {
        const data = ctx.body;
        // 这里可以实现具体的业务逻辑，如数据库保存操作
        
        return BaseResultData.ok();
    } catch (error) {
        // 错误处理
        return BaseResultData.fail(500, error);
    }
}
```

## 五、整合代码

将创建的文件进行整合，更新 `route.ts` 文件以引用 DTO 和处理函数：

```ts
// route.ts
import type { IRouteModule } from "@/types/route";
import { CreateDto } from "./dto";
import { create } from "./handle";

const BusinessGoodsModule: IRouteModule = {
    // 业务模块分类名称
    tags: '商品管理',
    // 接口列表
    routes: [
        {
            url: '/business/goods', // 接口路径
            method: 'post', // 接口方法
            summary: '创建商品', // 接口描述
            dto: CreateDto, // 接口参数校验
            handle: create, // 接口处理函数
            // 接口元数据
            meta: { 
                isAuth: true, // 是否登录后才能访问
                isLog: true, // 是否记录日志
                ipRateLimit: '60:2', // IP 限流配置（60s 内最多 2 次请求）
                permission: 'business:goods:create', // 权限配置
            },
        }
    ],
};

export default BusinessGoodsModule;
```

```ts
// dto.ts
import { t } from 'elysia';
import { BaseResultDto } from '@/types/dto';

export const CreateDto = {
    body: t.Object({
        name: t.String({ description: '商品名称', error: '商品名称格式错误', minLength: 5 }),
        price: t.Number({ description: '商品价格', error: '商品价格格式错误', min: 0 }),
        stock: t.Number({ description: '商品库存', error: '商品库存格式错误', min: 0 }),
        remark: t.Optional(t.String({ description: '商品备注' })),
    }),
};
```

```ts
// handle.ts
import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';

export async function create(ctx: Context) {
    try {
        const data = ctx.body;
        // 保存操作
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

通过以上步骤，我们成功创建了一个具备以下特性的商品创建接口：

- **模块化设计**：代码结构清晰，职责分明
- **登录认证**：通过 `isAuth: true` 确保只有登录用户可以访问
- **参数校验**：使用 DTO 验证请求参数的合法性
- **操作日志**：通过 `isLog: true` 记录接口调用情况
- **接口限流**：通过 `ipRateLimit` 防止恶意请求
- **权限控制**：通过 `permission` 配置实现细粒度的权限管理