import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { pgClient } from '@/core/database/pg';
import { logServerError } from '@/shared/server-error';

const MAX_ROWS = 1000;

/**
 * 执行任意 SQL（仅开发环境注册）。
 * 1. 读取并 trim 请求体 sql
 * 2. 通过 pgClient.unsafe 执行
 * 3. 组装列名与行数据，SELECT 结果超过 MAX_ROWS 时截断
 * @param ctx 请求上下文（body.sql）
 * @returns 执行结果或失败信息
 */
export async function execute(ctx: AppContext) {
    const { sql: sqlText } = (ctx.body || {}) as { sql?: string };
    const text = typeof sqlText === 'string' ? sqlText.trim() : '';
    if (!text) return BaseResultData.fail(400, 'SQL不能为空');

    const started = Date.now();
    try {
        const result = await pgClient.unsafe(text);
        const durationMs = Date.now() - started;
        const columns =
            result.columns?.map((col) => col.name).filter(Boolean) ??
            (result[0] ? Object.keys(result[0] as Record<string, unknown>) : []);
        const totalRows = result.length;
        const truncated = totalRows > MAX_ROWS;
        const rows = truncated
            ? (result.slice(0, MAX_ROWS) as Record<string, unknown>[])
            : (result as Record<string, unknown>[]);

        return BaseResultData.ok({
            columns,
            rows,
            rowCount: typeof result.count === 'number' ? result.count : totalRows,
            command: result.command ?? null,
            durationMs,
            truncated,
        });
    } catch (error: unknown) {
        logServerError('dev-sql/execute', error);
        const msg = error instanceof Error ? error.message : String(error);
        return BaseResultData.fail(500, msg || 'SQL执行失败');
    }
}