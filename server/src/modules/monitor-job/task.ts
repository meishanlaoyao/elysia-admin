import { logger } from "@/shared/logger";
import type { ITask } from "@/types/task";

function jobDemo(name: string, age?: number, isActive?: boolean) {
    logger.info(`jobDemo 执行 - 姓名: ${name}, 年龄: ${age || '未提供'}, 状态: ${isActive ? '激活' : '未激活'}`);
};

const MonitorJobTask: ITask[] = [
    {
        taskName: '测试任务',
        taskFunc: jobDemo
    }
];

export default MonitorJobTask;