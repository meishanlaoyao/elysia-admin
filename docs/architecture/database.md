# 数据库设计

本文档详细介绍 Elysia Admin 的数据库设计，包括表结构、字段说明、关系设计和最佳实践。

## 数据库技术栈

- **数据库：** PostgreSQL 16+
- **ORM：** Drizzle ORM
- **缓存：** Redis 7+
- **迁移工具：** Drizzle Kit

## 设计原则

1. **统一基础字段：** 所有表都继承 `BaseSchema`，包含创建时间、更新时间、创建人、更新人、删除标志和备注字段
2. **软删除：** 使用 `delFlag` 字段标记删除状态，不物理删除数据
3. **主键策略：** 使用 `bigserial` 类型的自增主键
4. **外键约束：** 使用外键保证数据完整性
5. **字段命名：** 采用驼峰命名法，与代码风格保持一致
6. **状态管理：** 使用 `boolean` 类型的 `status` 字段管理启用/禁用状态

## 基础字段（BaseSchema）

所有表都包含以下基础字段：

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| createTime | timestamp | 创建时间 | 当前时间 |
| createBy | bigint | 创建人ID | null |
| updateTime | timestamp | 更新时间 | null |
| updateBy | bigint | 更新人ID | null |
| delFlag | boolean | 删除标志 | false |
| remark | varchar(255) | 备注 | null |

## 数据库表分类

### 系统管理模块（System）

#### 1. system_user - 用户表

存储系统用户的基本信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| userId | bigserial | PK | 用户ID |
| username | varchar(64) | NOT NULL, UNIQUE | 用户名 |
| password | varchar(255) | NOT NULL | 密码（加密存储） |
| nickname | varchar(64) | | 昵称 |
| email | varchar(64) | | 邮箱 |
| phone | varchar(11) | | 手机号 |
| sex | varchar(1) | | 性别（0未知 1男 2女） |
| avatar | varchar(255) | | 头像URL |
| deptId | bigint | FK | 部门ID |
| status | boolean | | 状态（true启用 false禁用） |

**关联关系：**
- 多对一：用户 → 部门（system_dept）
- 多对多：用户 ↔ 角色（system_user_role）

#### 2. system_role - 角色表

定义系统角色和权限组。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| roleId | bigserial | PK | 角色ID |
| roleName | varchar(64) | NOT NULL | 角色名称 |
| roleCode | varchar(64) | NOT NULL | 角色编码 |
| sort | integer | | 排序 |
| status | boolean | | 状态 |

**关联关系：**
- 多对多：角色 ↔ 用户（system_user_role）
- 多对多：角色 ↔ 菜单（system_role_menu）

#### 3. system_user_role - 用户角色关联表

用户与角色的多对多关系表。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| userId | bigint | FK | 用户ID |
| roleId | bigint | FK | 角色ID |

#### 4. system_menu - 菜单表

存储系统菜单和路由配置。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| menuId | bigserial | PK | 菜单ID |
| path | varchar(255) | | 路由路径 |
| name | varchar(64) | | 路由名称 |
| component | varchar(255) | | 组件路径 |
| title | varchar(64) | | 菜单标题 |
| icon | varchar(64) | | 图标 |
| showBadge | boolean | | 是否显示徽章 |
| showTextBadge | varchar(64) | | 文本徽章内容 |
| isHide | boolean | | 是否隐藏 |
| isHideTab | boolean | | 是否在标签页中隐藏 |
| link | varchar(255) | | 外部链接 |
| isIframe | boolean | | 是否为iframe |
| isFullPage | boolean | | 是否全屏显示 |
| keepAlive | boolean | | 是否缓存 |
| fixedTab | boolean | | 是否固定标签页 |
| activePath | varchar(255) | | 激活路径 |
| sort | integer | | 排序 |
| status | boolean | | 状态 |
| parentId | bigint | | 父菜单ID |

**特点：**
- 支持树形结构（通过 parentId）
- 支持外部链接和 iframe
- 支持路由缓存和标签页固定

#### 5. system_menu_btn - 菜单按钮表

存储菜单下的操作按钮权限。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| btnId | bigserial | PK | 按钮ID |
| menuId | bigint | FK | 所属菜单ID |
| title | varchar(64) | | 按钮名称 |
| permission | varchar(64) | | 权限标识 |
| sort | integer | | 排序 |
| status | boolean | | 状态 |

#### 6. system_role_menu - 角色菜单关联表

角色与菜单/按钮的多对多关系表。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| roleId | bigint | FK | 角色ID |
| menuId | bigint | FK | 菜单ID |
| menuBtnId | bigint | FK | 按钮ID |

#### 7. system_dept - 部门表

组织架构的部门信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| deptId | bigserial | PK | 部门ID |
| deptName | varchar(64) | NOT NULL | 部门名称 |
| parentId | bigint | | 父部门ID |
| sort | integer | | 排序 |
| status | boolean | | 状态 |

**特点：**
- 支持树形结构
- 用于用户的组织归属

#### 8. system_api - API接口表

记录系统所有API接口。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| apiId | bigserial | PK | API ID |
| apiName | varchar(64) | NOT NULL | API名称 |
| apiPath | varchar(255) | NOT NULL | API路径 |
| apiMethod | varchar(10) | NOT NULL | 请求方法 |
| status | boolean | | 状态 |

**用途：**
- API权限管理
- 接口文档生成
- 访问控制

#### 9. system_dict_type - 字典类型表

系统字典类型定义。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| dictId | bigserial | PK | 字典ID |
| dictName | varchar(64) | NOT NULL, UNIQUE | 字典名称 |
| dictType | varchar(64) | NOT NULL, UNIQUE | 字典类型 |
| status | boolean | | 状态 |

#### 10. system_dict_data - 字典数据表

字典的具体数据项。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| dictCode | bigserial | PK | 字典数据ID |
| dictType | varchar(64) | NOT NULL | 字典类型 |
| dictLabel | varchar(64) | NOT NULL | 字典标签 |
| dictValue | varchar(64) | NOT NULL | 字典值 |
| dictSort | integer | | 排序 |
| tagType | varchar(64) | | 标签类型 |
| customClass | varchar(64) | | 自定义样式类 |
| status | boolean | | 状态 |

**用途：**
- 下拉选项
- 状态码映射
- 配置项管理

#### 11. system_login_log - 登录日志表

记录用户登录行为。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| logId | bigserial | PK | 日志ID |
| loginType | varchar(32) | | 登录类型 |
| loginName | varchar(64) | | 登录用户名 |
| clientType | varchar(32) | | 客户端类型 |
| clientPlatform | varchar(32) | | 客户端平台 |
| ipaddr | varchar(128) | | IP地址 |
| loginLocation | varchar(256) | | 登录地点 |
| userAgent | varchar(512) | | 用户代理 |
| os | varchar(64) | | 操作系统 |
| message | varchar(255) | | 提示消息 |
| status | boolean | | 登录状态 |

**用途：**
- 安全审计
- 异常登录检测
- 用户行为分析

#### 12. system_oper_log - 操作日志表

记录用户操作行为。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| operId | bigserial | PK | 操作ID |
| title | varchar(255) | | 模块标题 |
| action | varchar(255) | | 操作名称 |
| requestMethod | varchar(10) | | 请求方法 |
| operatorType | varchar(32) | | 操作人类型 |
| userId | bigint | | 操作人ID |
| operName | varchar(64) | | 操作人名称 |
| operUrl | varchar(256) | | 操作URL |
| operIp | varchar(128) | | 操作IP |
| operLocation | varchar(256) | | 操作地点 |
| operParam | varchar(1024) | | 操作参数 |
| jsonResult | varchar(1024) | | 返回结果 |
| costTime | integer | | 耗时（毫秒） |
| status | boolean | | 操作状态 |

**用途：**
- 操作审计
- 问题追踪
- 性能分析

#### 13. system_ip_black - IP黑名单表

管理被禁止访问的IP地址。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| ipBlackId | bigserial | PK | 黑名单ID |
| ipAddress | varchar(64) | NOT NULL, UNIQUE | IP地址 |
| status | boolean | | 状态 |

**用途：**
- 安全防护
- 恶意访问拦截

#### 14. system_storage - 存储配置表

管理文件存储配置（OSS、S3等）。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| storageId | bigserial | PK | 存储ID |
| name | varchar(64) | NOT NULL, UNIQUE | 存储名称 |
| region | varchar(64) | | 区域 |
| endpoint | varchar(255) | | 存储端点 |
| bucket | varchar(128) | | 存储桶 |
| accessKey | varchar(128) | | 访问密钥 |
| secretKey | varchar(128) | | 密钥 |
| status | boolean | | 状态 |

**支持的存储类型：**
- 阿里云 OSS
- 腾讯云 COS
- AWS S3
- MinIO

### 监控管理模块（Monitor）

#### 15. monitor_job - 定时任务表

管理系统定时任务。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| jobId | bigserial | PK | 任务ID |
| jobName | varchar(64) | NOT NULL, UNIQUE | 任务名称 |
| jobCron | varchar(64) | NOT NULL | CRON表达式 |
| jobArgs | varchar(256) | | 任务参数 |
| status | boolean | | 状态 |

**用途：**
- 定时数据清理
- 定时报表生成
- 定时数据同步

### 业务管理模块（Business）

#### 16. business_merchant - 商户表

管理商户基本信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | bigserial | PK | 商户ID |
| name | varchar(100) | NOT NULL | 商户名称 |
| status | boolean | | 状态 |

#### 17. business_merchant_configs - 商户配置表

存储商户的支付渠道配置。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | bigserial | PK | 配置ID |
| merchantId | bigint | FK, NOT NULL | 商户ID |
| channel | varchar(20) | NOT NULL | 支付渠道 |
| appId | varchar(100) | | 应用ID |
| mchId | varchar(100) | | 商户号 |
| privateKey | text | | 商户私钥 |
| publicKey | text | | 平台公钥 |
| config | jsonb | | 扩展配置 |
| status | boolean | | 状态 |

**支持的支付渠道：**
- 支付宝（Alipay）
- 微信支付（WeChat）
- PayPal

#### 18. business_orders - 订单表

存储业务订单信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | bigserial | PK | 订单ID |
| orderNo | varchar(64) | NOT NULL, UNIQUE | 订单号 |
| userId | bigint | NOT NULL | 用户ID |
| merchantId | bigint | FK, NOT NULL | 商户ID |
| title | varchar(200) | NOT NULL | 订单标题 |
| description | varchar(500) | | 订单描述 |
| amount | decimal(10,2) | NOT NULL | 订单金额 |
| currency | varchar(10) | | 货币类型 |
| status | varchar(20) | | 订单状态 |
| expireTime | timestamp | | 过期时间 |
| paymentMethod | varchar(20) | NOT NULL | 支付方式 |
| extra | jsonb | | 扩展字段 |

**订单状态（字典：system_orders_status）：**
- 0: 待支付
- 1: 已支付
- 2: 已取消
- 3: 已过期
- 4: 已退款

#### 19. business_payments - 支付记录表

记录订单的支付流水。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | bigserial | PK | 支付ID |
| orderId | bigint | FK, NOT NULL | 订单ID |
| merchantConfigId | bigint | FK, NOT NULL | 商户配置ID |
| paymentNo | varchar(64) | UNIQUE | 支付单号 |
| channel | varchar(20) | NOT NULL | 支付渠道 |
| platform | varchar(20) | | 支付平台 |
| amount | decimal(10,2) | NOT NULL | 支付金额 |
| status | varchar(20) | | 支付状态 |
| thirdTradeNo | varchar(100) | | 第三方交易号 |
| extra | jsonb | | 扩展字段 |

**支付状态（字典：system_pay_status）：**
- 0: 待支付
- 1: 支付成功
- 2: 支付失败
- 3: 已关闭

#### 20. business_refund - 退款表

管理订单退款记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | bigserial | PK | 退款ID |
| orderId | bigint | FK, NOT NULL | 订单ID |
| paymentId | bigint | FK, NOT NULL | 支付记录ID |
| refundNo | varchar(64) | NOT NULL, UNIQUE | 退款单号 |
| amount | decimal(10,2) | NOT NULL | 退款金额 |
| status | varchar(20) | | 退款状态 |
| thirdRefundNo | varchar(100) | | 第三方退款单号 |
| extra | jsonb | | 扩展字段 |

**退款状态（字典：system_refund_status）：**
- 0: 退款中
- 1: 退款成功
- 2: 退款失败

## 索引设计

### 推荐索引

```sql
-- 用户表
CREATE INDEX idx_user_username ON system_user(username);
CREATE INDEX idx_user_dept ON system_user(dept_id);
CREATE INDEX idx_user_status ON system_user(status);

-- 菜单表
CREATE INDEX idx_menu_parent ON system_menu(parent_id);
CREATE INDEX idx_menu_status ON system_menu(status);

-- 订单表
CREATE INDEX idx_order_no ON business_orders(order_no);
CREATE INDEX idx_order_user ON business_orders(user_id);
CREATE INDEX idx_order_merchant ON business_orders(merchant_id);
CREATE INDEX idx_order_status ON business_orders(status);
CREATE INDEX idx_order_create_time ON business_orders(create_time);

-- 支付表
CREATE INDEX idx_payment_order ON business_payments(order_id);
CREATE INDEX idx_payment_no ON business_payments(payment_no);
CREATE INDEX idx_payment_third_trade ON business_payments(third_trade_no);

-- 日志表
CREATE INDEX idx_login_log_time ON system_login_log(create_time);
CREATE INDEX idx_oper_log_time ON system_oper_log(create_time);
CREATE INDEX idx_oper_log_user ON system_oper_log(user_id);
```

## 数据库操作

### 初始化数据库

```bash
# 推送数据库结构
cd server
bun db:push
```

### 数据迁移

```bash
# 生成迁移文件
bun drizzle-kit generate

# 执行迁移
bun drizzle-kit migrate
```

### 数据库同步

```bash
# 从数据库拉取结构
bun db:pull
```

## 性能优化建议

1. **合理使用索引：** 为常用查询字段添加索引
2. **分页查询：** 大数据量查询使用分页
3. **避免 N+1 查询：** 使用 JOIN 或批量查询
4. **使用连接池：** 配置合适的数据库连接池大小
5. **定期清理日志：** 定时清理过期的日志数据
6. **使用 Redis 缓存：** 缓存热点数据和字典数据


## 相关文档

- [数据库操作指南](/guide/database-operation.html)
- [缓存使用指南](/guide/cache.html)