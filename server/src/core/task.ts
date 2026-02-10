/**
 * 任务接口定义
 */
export interface ITask {
    taskName: string;
    taskFunc: (...args: any[]) => void | Promise<void>;
};