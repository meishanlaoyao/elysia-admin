# 定时任务动态参数使用指南

## 概述

定时任务支持从数据库动态读取参数，参数以 JSON 字符串格式存储在 `job_args` 字段中。

## 数据库配置

### 字段说明

```sql
job_args VARCHAR(256) -- 任务参数，JSON 字符串格式
```

### 插入示例

#### 1. 数组参数（推荐）

```sql
-- 单个参数
INSERT INTO monitor_job (job_name, job_cron, job_args, status) 
VALUES ('测试定时任务', '0/10 * * * * ?', '["乔治"]', true);

-- 多个参数
INSERT INTO monitor_job (job_name, job_cron, job_args, status) 
VALUES ('测试定时任务', '0/10 * * * * ?', '["乔治", 25, true]', true);

-- 无参数
INSERT INTO monitor_job (job_name, job_cron, job_args, status) 
VALUES ('简单任务', '0/30 * * * * ?', NULL, true);
-- 或
VALUES ('简单任务', '0/30 * * * * ?', '[]', true);
```

#### 2. 对象参数

```sql
-- 单个对象参数（会自动转换为数组）
INSERT INTO monitor_job (job_name, job_cron, job_args, status) 
VALUES ('对象参数任务', '0 */5 * * * ?', '{"name": "张三", "value": 100}', true);
```

## 代码实现

### 1. 定义任务函数

```typescript
// src/modules/monitor-job/task.ts
import type { ITask } from "@/core/task";
import { logger } from "@/shared/logger";

// 接收多个参数
function jobDemo(name: string, age?: number, isActive?: boolean) {
    logger.info(`姓名: ${name}, 年龄: ${age}, 状态: ${isActive}`);
}

// 接收对象参数
function jobWithObject(config: { name: string; value: number }) {
    logger.info(`配置: ${JSON.stringify(config)}`);
}

// 无参数
function simpleJob() {
    logger.info('执行简单任务');
}

const MonitorJobTask: ITask[] = [
    { 
        taskName: '测试定时任务', 
        taskFunc: jobDemo  // 直接传入函数，参数由系统注入
    },
    {
        taskName: '对象参数任务',
        taskFunc: jobWithObject
    },
    {
        taskName: '简单任务',
        taskFunc: simpleJob
    }
];

export default MonitorJobTask;
```

### 2. 参数解析流程

系统会自动：
1. 从数据库读取 `job_args` 字段
2. 使用 `JSON.parse()` 解析 JSON 字符串
3. 验证是否为数组格式（如果不是，自动转换）
4. 将参数传递给任务函数

## 参数类型支持

### 基本类型

```sql
-- 字符串
'["hello"]'

-- 数字
'[123, 45.6]'

-- 布尔值
'[true, false]'

-- 混合类型
'["张三", 25, true, 99.9]'
```

### 复杂类型

```sql
-- 对象
'[{"name": "张三", "age": 25}]'

-- 数组
'[["item1", "item2"], [1, 2, 3]]'

-- 嵌套结构
'[{"user": {"name": "张三", "roles": ["admin", "user"]}, "count": 10}]'
```

## 完整示例

### 数据库记录

```sql
INSERT INTO monitor_job (job_name, job_cron, job_args, status, remark) 
VALUES 
  ('测试定时任务', '0/10 * * * * ?', '["乔治", 25, true]', true, '每10秒执行一次'),
  ('对象参数任务', '0 */5 * * * ?', '[{"name": "张三", "value": 100}]', true, '每5分钟执行'),
  ('简单任务', '0 0 * * * ?', NULL, true, '每小时执行');
```

### 任务定义

```typescript
// src/modules/monitor-job/task.ts
import type { ITask } from "@/core/task";
import { logger } from "@/shared/logger";

function jobDemo(name: string, age: number, isActive: boolean) {
    logger.info(`用户: ${name}, 年龄: ${age}, 激活: ${isActive}`);
    // 执行业务逻辑...
}

function jobWithObject(config: { name: string; value: number }) {
    logger.info(`处理配置: ${config.name} = ${config.value}`);
    // 执行业务逻辑...
}

function simpleJob() {
    logger.info('执行定时清理任务');
    // 执行业务逻辑...
}

const MonitorJobTask: ITask[] = [
    { taskName: '测试定时任务', taskFunc: jobDemo },
    { taskName: '对象参数任务', taskFunc: jobWithObject },
    { taskName: '简单任务', taskFunc: simpleJob }
];

export default MonitorJobTask;
```

### 执行日志

```
[INFO] 注册任务: 测试定时任务
[INFO] 注册任务: 对象参数任务
[INFO] 注册任务: 简单任务
[INFO] 定时任务 [测试定时任务] 已启动，cron: 0/10 * * * * ?，参数: ["乔治",25,true]
[INFO] 定时任务 [对象参数任务] 已启动，cron: 0 */5 * * * ?，参数: [{"name":"张三","value":100}]
[INFO] 定时任务 [简单任务] 已启动，cron: 0 0 * * * ?
[INFO] 任务 [测试定时任务] 开始执行
[INFO] 用户: 乔治, 年龄: 25, 激活: true
[INFO] 任务 [测试定时任务] 执行完成
```

## 注意事项

1. **JSON 格式校验**：确保 `job_args` 是有效的 JSON 字符串
2. **参数顺序**：数组参数按顺序传递给函数
3. **参数数量**：函数参数可以使用可选参数（`?`）来处理参数缺失
4. **类型安全**：建议在任务函数中进行参数类型验证
5. **错误处理**：如果参数解析失败，任务会使用空数组 `[]` 作为参数

## 动态更新参数

更新数据库中的参数后，需要重启任务：

```typescript
import { RemoveCronJob, AddCronJob } from '@/shared/cron';

// 移除旧任务
RemoveCronJob('测试定时任务');

// 重新添加（会从数据库读取最新参数）
AddCronJob('测试定时任务', '0/10 * * * * ?', '测试定时任务', ["新参数"]);
```

或者重启应用以重新加载所有任务配置。
