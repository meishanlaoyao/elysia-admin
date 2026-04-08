# 定时任务

本章将详细介绍如何在系统中创建、配置并运行一个定时任务（Cron Job）。

## 一、 创建任务定义

在 `/server/src/modules/` 目录下的任意模块中，创建一个 `task.ts` 文件用于定义该模块相关的定时任务。

### 1. 编写任务代码

在 `task.ts` 中实现你的任务逻辑，并导出任务配置数组：

```ts
import { logger } from "@/shared/logger";
import type { ITask } from "@/types/task";

/**
 * 示例任务函数，可以把处理逻辑放入 handle.ts 中
 */
function jobDemo(name: string, age?: number, isActive?: boolean) {
    logger.info(`jobDemo 执行 - 姓名: ${name}, 年龄: ${age || '未提供'}, 状态: ${isActive ? '激活' : '未激活'}`);
}

const MonitorJobTask: ITask[] = [
    {
        taskName: '测试任务', // 必须与后台配置的“任务名称”保持一致
        taskFunc: jobDemo,   // 任务实际执行的函数
    }
];

export default MonitorJobTask;
```

### 2. 任务注册说明

- 自动注册：保存文件后，系统会自动扫描并注册该任务定义。
- 触发机制：任务定义完成后并不会立即运行，需要在后台管理系统中添加具体的任务调度配置。
- 示例参考：你可以参考 `/server/src/modules/monitor-job/task.ts` 中的演示代码。

## 二、 后台管理配置

完成代码定义后，需前往后台管理系统进行调度配置。

### 1. 添加任务数据

访问路径：`系统监控` -> `定时任务`。

![添加任务](/guide/1.png)

### 2. 表单字段说明

- 任务名称：**关键字段**。必须与代码中 `ITask` 对象的 `taskName` 属性完全一致，且全局唯一。
- Cron 表达式：定义任务的执行频率。建议使用 [Cron 表达式在线生成工具](https://tool.lu/crontab/) 进行校验。
- 任务参数：
  - 使用 JSON 数组格式包裹（例如：`["张三", 25, true]`）。
  - 参数顺序及类型必须与代码中定义的函数参数（如 `jobDemo`）一一对应。

### 3. 启用任务

提交表单后，确保任务状态设置为“开启”，系统将根据设定的 Cron 表达式自动触发执行。

## 三、 多实例与高可用

系统内置了分布式锁机制，以确保在多实例部署环境下任务的执行安全：

- 分布式执行：系统使用 `Redis 分布式锁` 进行协调。
- 单实例运行：即使部署了多个服务实例，同一个任务在同一触发时间内也只会由一个实例执行，有效避免了重复执行带来的数据一致性问题。