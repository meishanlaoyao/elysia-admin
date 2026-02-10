# 定时任务系统使用文档

## 概述

基于任务注册机制的定时任务系统，支持：
- 模块化任务管理
- 自动任务注册
- 单机防重（文件锁）
- 动态添加/移除任务
- 通过 jobName 匹配 taskName

## 目录结构

```
src/
├── core/
│   ├── task.ts              # 任务接口定义
│   └── task-registry.ts     # 任务注册器
├── shared/
│   └── cron.ts              # 定时任务核心
└── modules/
    └── {module-name}/
        └── task.ts          # 模块任务定义
```

## 使用步骤

### 1. 定义任务

在任何模块下创建 `task.ts` 文件：

```typescript
// src/modules/monitor-job/task.ts
import type { ITask } from "@/core/task";
import { logger } from "@/shared/logger";

function jobDemo(name: string) {
    logger.info(`jobDemo 执行，参数: ${name}`);
}

function anotherTask() {
    logger.info('另一个任务执行');
}

const MonitorJobTask: ITask[] = [
    { 
        taskName: '测试定时任务', 
        taskFunc: () => jobDemo('乔治')
    },
    {
        taskName: '另一个任务',
        taskFunc: anotherTask
    }
];

export default MonitorJobTask;
```

### 2. 自动注册

系统启动时会自动扫描 `src/modules/` 下所有模块的 `task.ts` 文件并注册：

```typescript
// script/seed.ts
await registerAllTasks();
```

### 3. 数据库配置

在 `monitor_job` 表中添加定时任务记录：

```sql
INSERT INTO monitor_job (job_name, job_cron, status) 
VALUES ('测试定时任务', '0/10 * * * * ?', true);
```

**注意：** `job_name` 必须与 `taskName` 完全匹配！

### 4. 启动任务

```typescript
await initCronJob();
```

## API 说明

### RegisterTasks(tasks: ITask[])
注册任务到任务注册表

### CreateCronJob(jobName, cronExpression, taskName, taskArgs?, options?)
创建定时任务
- `jobName`: 任务标识（用于防重）
- `cronExpression`: cron 表达式
- `taskName`: 任务名称（从注册表查找）
- `taskArgs`: 可选参数数组
- `options`: croner 选项

### AddCronJob(jobName, cronExpression, taskName, taskArgs?)
动态添加定时任务（会自动检查并替换已存在的任务）

### RemoveCronJob(jobName)
移除定时任务

### GetTask(taskName)
获取已注册的任务

### GetAllTasks()
获取所有已注册的任务

### GetCronJob(jobName)
获取运行中的定时任务实例

### GetAllCronJobs()
获取所有运行中的定时任务

## Cron 表达式示例

```
0/10 * * * * ?    # 每10秒执行
0 */5 * * * ?     # 每5分钟执行
0 0 * * * ?       # 每小时执行
0 0 0 * * ?       # 每天0点执行
0 0 12 * * ?      # 每天12点执行
```

## 单机防重机制

- 每个任务执行前会创建锁文件：`{项目根目录}/job/cron_{jobName}.lock`
- 如果锁文件存在，跳过本次执行
- 任务完成后自动释放锁
- 支持多实例部署，确保同一时刻只有一个实例执行任务

## 注意事项

1. **taskName 必须唯一**：同名任务会被覆盖
2. **jobName 与 taskName 匹配**：数据库中的 `job_name` 必须与代码中的 `taskName` 一致
3. **任务函数必须导出**：确保 task.ts 默认导出 ITask 数组
4. **参数传递**：如果任务需要参数，在 taskFunc 中使用闭包或箭头函数
5. **错误处理**：任务函数内部应该处理异常，避免影响定时调度

## 示例：动态管理任务

```typescript
import { AddCronJob, RemoveCronJob, GetAllCronJobs } from '@/shared/cron';

// 添加任务
AddCronJob('新任务', '*/30 * * * * ?', '测试定时任务');

// 移除任务
RemoveCronJob('新任务');

// 查看所有运行中的任务
const jobs = GetAllCronJobs();
console.log(`当前运行 ${jobs.size} 个任务`);
```
