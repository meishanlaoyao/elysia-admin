/**
 * Processor 公共工具
 * 可在所有 processor.ts 中直接 import 使用
 */

export type TaskFn = (...args: any[]) => void | Promise<void>;

/**
 * 创建一个 task 注册表
 * 每个 processor 文件调用此函数创建自己的注册表
 */
export function createTaskRegistry() {
    const registry = new Map<string, TaskFn>();
    function register(name: string, fn: TaskFn) {
        registry.set(name, fn);
    };
    function get(name: string): TaskFn | undefined {
        return registry.get(name);
    };
    return { register, get };
};

/**
 * 解析 jobArgs 为数组
 * 支持 JSON 字符串、数组、原始值
 */
export function parseArgs(jobArgs?: string | any[]): any[] {
    if (!jobArgs) return [];
    if (Array.isArray(jobArgs)) return jobArgs;
    try {
        const parsed = JSON.parse(jobArgs);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return [jobArgs];
    }
};