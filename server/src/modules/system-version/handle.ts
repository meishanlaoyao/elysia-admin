import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { getDistRoot } from '@/shared/log-stream';

/** 版本条目结构（version.json 中 current 与 history 单项） */
export interface VersionItem {
    version: string;
    releaseTime: string;
    title: string;
    forceUpdate: boolean;
    content: string;
};

/** 版本信息整体结构 */
export interface VersionInfo {
    current: VersionItem;
    history: VersionItem[];
};

/**
 * 解析 version.json 所在目录
 * 生产环境跟随 dist 根目录，开发环境为 server 项目根目录
 * @returns version.json 的绝对路径
 */
function getVersionFilePath(): string {
    const distRoot = getDistRoot();
    return join(distRoot ?? process.cwd(), 'version.json');
};

/**
 * 读取版本信息（当前版本 + 历史版本列表）
 *
 * 处理流程：
 * 1. 定位 version.json（dist 根目录，回退 cwd）
 * 2. 每次请求实时读取，不做进程内缓存，发版替换文件后立即生效
 * 3. 文件缺失、JSON 解析失败或缺少 current 时返回 500 与中文提示
 *
 * @param _ctx Elysia 上下文（本接口无入参）
 * @returns 版本信息或错误结果
 */
export async function getVersionInfo(_ctx: AppContext) {
    const filePath = getVersionFilePath();
    if (!existsSync(filePath)) {
        return BaseResultData.fail(500, '版本信息文件缺失或格式错误');
    };
    let parsed: Partial<VersionInfo>;
    try {
        parsed = JSON.parse(readFileSync(filePath, 'utf-8')) as Partial<VersionInfo>;
    } catch {
        return BaseResultData.fail(500, '版本信息文件缺失或格式错误');
    };
    if (!parsed || typeof parsed !== 'object' || !parsed.current) {
        return BaseResultData.fail(500, '版本信息文件缺失或格式错误');
    };
    const data: VersionInfo = {
        current: parsed.current,
        history: Array.isArray(parsed.history) ? parsed.history : [],
    };
    return BaseResultData.ok(data);
};