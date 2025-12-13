# 系统用户 API

系统用户模块提供用户管理的完整 CRUD 操作。

## 基础路径

所有接口的基础路径为：`/api/system/user`

## 接口列表

### 1. 创建用户

创建一个新的系统用户。

**请求**

```http
POST /api/system/user
Content-Type: application/json
```

**请求体**

```json
{
  "username": "admin",
  "password": "123456",
  "email": "admin@example.com",
  "phone": "13800138000"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名，最大长度 64 |
| password | string | 是 | 密码，最大长度 255 |
| email | string | 否 | 邮箱，最大长度 64 |
| phone | string | 否 | 手机号，最大长度 11 |

**响应**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

---

### 2. 查询所有用户

查询所有未删除的用户（不包含密码字段）。

**请求**

```http
GET /api/system/user/all
```

**响应**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "userId": 1,
      "username": "admin",
      "nickname": "管理员",
      "email": "admin@example.com",
      "phone": "13800138000",
      "sex": "1",
      "avatar": "https://example.com/avatar.jpg",
      "createTime": "2024-01-01T00:00:00.000Z",
      "updateTime": "2024-01-01T00:00:00.000Z",
      "delFlag": false
    }
  ]
}
```

---

### 3. 分页查询用户

分页查询用户列表，支持多条件筛选。

**请求**

```http
GET /api/system/user/list?pageNum=1&pageSize=10&username=admin
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| pageNum | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| orderByColumn | string | 否 | createTime | 排序字段 |
| sortRule | string | 否 | desc | 排序规则（asc/desc） |
| startTime | string | 否 | - | 开始时间 |
| endTime | string | 否 | - | 结束时间 |
| username | string | 否 | - | 用户名（模糊查询） |
| nickname | string | 否 | - | 昵称（模糊查询） |
| email | string | 否 | - | 邮箱（精确查询） |
| phone | string | 否 | - | 手机号（精确查询） |
| sex | string | 否 | - | 性别（0:未知 1:男 2:女） |

**响应**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "list": [
      {
        "userId": 1,
        "username": "admin",
        "nickname": "管理员",
        "email": "admin@example.com",
        "phone": "13800138000",
        "sex": "1",
        "avatar": "https://example.com/avatar.jpg",
        "createTime": "2024-01-01T00:00:00.000Z",
        "updateTime": "2024-01-01T00:00:00.000Z",
        "delFlag": false
      }
    ],
    "total": 100
  }
}
```

---

### 4. 查询用户详情

根据用户 ID 查询用户详细信息。

**请求**

```http
GET /api/system/user/:id
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 用户 ID |

**示例**

```http
GET /api/system/user/1
```

**响应**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "userId": 1,
    "username": "admin",
    "nickname": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "sex": "1",
    "avatar": "https://example.com/avatar.jpg",
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z",
    "delFlag": false
  }
}
```

**错误响应**

```json
{
  "code": 404,
  "msg": "资源不存在",
  "data": null
}
```

---

### 5. 更新用户

更新用户信息。

**请求**

```http
PUT /api/system/user
Content-Type: application/json
```

**请求体**

```json
{
  "userId": 1,
  "username": "admin",
  "nickname": "超级管理员",
  "email": "admin@example.com",
  "phone": "13800138000",
  "sex": "1",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | number | 是 | 用户 ID |
| username | string | 是 | 用户名 |
| password | string | 否 | 密码（如果提供会重新加密） |
| nickname | string | 否 | 昵称 |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |
| sex | string | 否 | 性别 |
| avatar | string | 否 | 头像 URL |

**响应**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

---

### 6. 删除用户

软删除一个或多个用户。

**请求**

```http
DELETE /api/system/user/:ids
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | string | 是 | 用户 ID，多个用逗号分隔 |

**示例**

```http
# 删除单个用户
DELETE /api/system/user/1

# 删除多个用户
DELETE /api/system/user/1,2,3
```

**响应**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

---

## 响应状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 数据模型

### User 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| userId | number | 用户 ID（主键） |
| username | string | 用户名（唯一） |
| password | string | 密码（加密存储，查询时不返回） |
| nickname | string | 昵称 |
| email | string | 邮箱 |
| phone | string | 手机号 |
| sex | string | 性别（0:未知 1:男 2:女） |
| avatar | string | 头像 URL |
| createBy | string | 创建者 |
| createTime | datetime | 创建时间 |
| updateBy | string | 更新者 |
| updateTime | datetime | 更新时间 |
| remark | string | 备注 |
| delFlag | boolean | 删除标志 |

## 注意事项

1. **密码安全**: 密码在存储前会使用 bcrypt 加密，查询时不会返回密码字段
2. **软删除**: 删除操作为软删除，数据不会真正从数据库中删除
3. **唯一性**: 用户名必须唯一
4. **分页**: 建议使用分页查询，避免一次性加载大量数据
5. **时间范围**: 时间查询支持 ISO 8601 格式
