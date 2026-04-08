# 缓存操作

本章介绍 `Elysia Admin` 中封装的常用 Redis 缓存操作方法，包括基础的缓存设置、获取、删除操作，以及高级的组合操作。

## 基础操作

### 设置缓存

```ts
Set(key, value, expire);
```

参数说明：
- `key`：缓存键，用于唯一标识缓存项
- `value`：缓存值，可以是任何类型（会自动序列化为 JSON）
- `expire`：过期时间，单位为秒（可选参数）
  - 如果设置了过期时间，则缓存会在指定时间后自动过期
  - 如果未设置过期时间，则保持原有的 TTL（如果键已存在）或永久存在（如果键不存在）

示例：

```ts
import { Set } from '@/core/database/redis';

// 设置缓存，60 秒后过期
await Set('user:1', { name: 'John', age: 30 }, 60);

// 设置缓存，不设置过期时间
await Set('config:app', { theme: 'dark' });
```

### 批量设置缓存

```ts
SetMulti(items);
```

参数说明：
- `items`：缓存项数组，每个项包含以下字段：
  - `key`：缓存键
  - `value`：缓存值
  - `expire`：过期时间（可选）

示例：

```ts
import { SetMulti } from '@/core/database/redis';

await SetMulti([
    { key: 'user:1', value: { name: 'John' }, expire: 60 },
    { key: 'user:2', value: { name: 'Jane' }, expire: 60 }
]);
```

### 获取缓存

```ts
Get(key);
```

参数说明：
- `key`：缓存键，用于唯一标识缓存项

返回值：
- 如果缓存存在，返回缓存值（自动反序列化 JSON）
- 如果缓存不存在，返回 `null`

示例：

```ts
import { Get } from '@/core/database/redis';

const user = await Get('user:1');
console.log(user); // { name: 'John', age: 30 }
```

### 删除缓存

```ts
Del(key);
```

参数说明：
- `key`：缓存键或缓存键数组，支持单个删除或批量删除

示例：

```ts
import { Del } from '@/core/database/redis';

// 删除单个缓存
await Del('user:1');

// 批量删除缓存
await Del(['user:1', 'user:2', 'user:3']);
```

### 获取匹配的缓存键

```ts
Keys(pattern);
```

参数说明：
- `pattern`：缓存键的匹配模式（支持通配符）

返回值：
- 匹配的缓存键数组

示例：

```ts
import { Keys } from '@/core/database/redis';

// 获取所有以 user: 开头的缓存键
const userKeys = await Keys('user:');
console.log(userKeys); // ['user:1', 'user:2', 'user:3']
```

## 组合操作

### 获取或设置缓存（防缓存击穿）

```ts
WithCache<T>(cacheKey, dbQueryFn, expire?, lockTtl?, retryTimes?, retryDelay?);
```

参数说明：
- `cacheKey`：Redis 缓存的键
- `dbQueryFn`：数据库查询函数（当缓存不存在时执行），返回一个 Promise
- `expire`：缓存过期时间（单位：秒），默认使用配置文件中的 `config.app.baseCacheTime`
- `lockTtl`：分布式锁的过期时间（单位：秒），默认 10 秒
- `retryTimes`：获取锁失败后的重试次数，默认 3 次
- `retryDelay`：重试间隔（单位：毫秒），默认 100ms

功能说明：

这是一个通用的缓存包装函数，用于防止缓存击穿。它的工作流程如下：

1. 首先尝试从 Redis 获取缓存数据
2. 如果缓存不存在，使用分布式锁来执行数据库查询
3. 查询结果会被缓存到 Redis 中
4. 如果获取锁失败，会进行重试
5. 如果重试后仍未获取到缓存，则直接查询数据库

示例：

```ts
import { WithCache } from '@/core/cache';
import { CreateQueryBuilder, FindAll } from '@/core/database/repository';
import { systemDictTypeSchema } from '@/database/schema/system_dict';

const data = await WithCache(
    'dict:types',
    async () => {
        const where = CreateQueryBuilder(systemDictTypeSchema)
            .eq('delFlag', false)
            .build();
        return await FindAll(systemDictTypeSchema, where);
    },
    300 // 缓存 5 分钟
);
```

### 更新缓存 - 插入新数据

```ts
CacheInsert(cacheKey, data);
```

参数说明：
- `cacheKey`：Redis 缓存的键
- `data`：要插入的数据

返回值：
- `boolean`：是否插入成功

功能说明：

此函数用于向现有缓存中插入新数据。如果缓存中已有数据，则将新数据添加到现有数据的末尾；如果缓存不存在，则创建一个包含新数据的缓存。

示例：

```ts
import { CacheInsert } from '@/core/cache';

// 向缓存中插入新用户
await CacheInsert('users:list', { id: 3, name: 'New User' });
```

### 更新缓存 - 删除指定数据

```ts
CacheDelete(cacheKey, key, values);
```

参数说明：
- `cacheKey`：Redis 缓存的键
- `key`：用于判断数据是否需要删除的字段名
- `values`：包含需要删除的数据的 `key` 字段值的数组

返回值：
- `boolean`：是否删除成功

功能说明：

此函数用于从现有缓存中删除指定数据。它会根据提供的 `key` 和 `values` 数组来过滤缓存中的数据。如果删除后缓存为空，则会删除整个缓存。

示例：

```ts
import { CacheDelete } from '@/core/cache';

// 从缓存中删除 id 为 1 和 2 的用户
await CacheDelete('users:list', 'id', [1, 2]);
```

### 更新缓存 - 更新指定数据

```ts
CacheUpdate(cacheKey, key, data);
```

参数说明：
- `cacheKey`：Redis 缓存的键
- `key`：用于判断数据是否需要更新的字段名
- `data`：要更新的数据，其中包含用于匹配的 `key` 字段值

返回值：
- `boolean`：是否更新成功

功能说明：

此函数用于更新缓存中的指定数据。它会遍历缓存中的数据，根据 `key` 字段匹配并更新相应的数据项。如果缓存中没有匹配项，则会将新数据作为新项插入。

示例：

```ts
import { CacheUpdate } from '@/core/cache';

// 更新缓存中 id 为 1 的用户信息
await CacheUpdate('users:list', 'id', { id: 1, name: 'Updated User', age: 25 });
```