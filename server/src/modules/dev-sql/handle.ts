import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { pgClient } from '@/core/database/pg';
import { logServerError } from '@/shared/server-error';

const MAX_ROWS = 1000;

/** 去掉注释后是否仍含显式事务关键字（postgres.js 连接池禁止 unsafe 发 BEGIN/COMMIT） */
function hasExplicitTransaction(sqlText: string): boolean {
    const withoutLineComments = sqlText.replace(/--[^\n]*/g, ' ');
    const withoutBlockComments = withoutLineComments.replace(/\/\*[\s\S]*?\*\//g, ' ');
    return /\b(BEGIN|COMMIT|ROLLBACK)\b/i.test(withoutBlockComments);
}

/**
 * 将含 BEGIN/COMMIT 的脚本拆成：事务体内语句 + COMMIT 之后语句。
 * postgres.js 要求事务走 sql.begin，不能把 BEGIN/COMMIT 交给 unsafe。
 */
function splitTransactionScript(sqlText: string): { inside: string; after: string } {
    const beginMatch = sqlText.match(/\bBEGIN\s*;/i);
    const commitMatch = sqlText.match(/\bCOMMIT\s*;/i);
    if (!beginMatch || beginMatch.index === undefined) {
        return {
            inside: sqlText
                .replace(/\bBEGIN\s*;/gi, '')
                .replace(/\bCOMMIT\s*;/gi, '')
                .replace(/\bROLLBACK\s*;/gi, '')
                .trim(),
            after: '',
        };
    }
    const afterBegin = sqlText.slice(beginMatch.index + beginMatch[0].length);
    if (!commitMatch || commitMatch.index === undefined || commitMatch.index < beginMatch.index) {
        return {
            inside: afterBegin.replace(/\bROLLBACK\s*;/gi, '').trim(),
            after: '',
        };
    }
    const commitOffsetInAfter = commitMatch.index - (beginMatch.index + beginMatch[0].length);
    const inside = afterBegin.slice(0, commitOffsetInAfter).trim();
    const after = afterBegin.slice(commitOffsetInAfter + commitMatch[0].length).trim();
    return { inside, after };
}

type SqlResult = Awaited<ReturnType<typeof pgClient.unsafe>>;

/**
 * 执行任意 SQL（仅开发环境注册）。
 * 1. 读取并 trim 请求体 sql
 * 2. 若含 BEGIN/COMMIT：剥离关键字，事务体走 pgClient.begin，其后语句再 unsafe
 * 3. 否则直接 pgClient.unsafe
 * 4. 组装列名与行数据，SELECT 结果超过 MAX_ROWS 时截断
 * @param ctx 请求上下文（body.sql）
 * @returns 执行结果或失败信息
 */
export async function execute(ctx: AppContext) {
    const { sql: sqlText } = (ctx.body || {}) as { sql?: string };
    const text = typeof sqlText === 'string' ? sqlText.trim() : '';
    if (!text) return BaseResultData.fail(400, 'SQL不能为空');

    const started = Date.now();
    try {
        let result: SqlResult;
        if (hasExplicitTransaction(text)) {
            const { inside, after } = splitTransactionScript(text);
            if (inside) {
                result = await pgClient.begin((tx) => tx.unsafe(inside));
            } else {
                result = [] as unknown as SqlResult;
            }
            if (after) {
                result = await pgClient.unsafe(after);
            }
        } else {
            result = await pgClient.unsafe(text);
        }

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