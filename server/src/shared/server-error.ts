import { logger } from '@/shared/logger';

type ErrorWithHttpStatus = Error & { httpStatus?: number };
type ErrorWithPgCode = Error & { code?: string; cause?: { code?: string } };

/** 读取业务层挂在 Error 上的 HTTP 状态码（如 RegisterUser 抛出的 409） */
export function getHttpStatus(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined;
    const status = (error as ErrorWithHttpStatus).httpStatus;
    return typeof status === 'number' ? status : undefined;
};

/** 读取 Postgres 驱动错误码（优先 cause.code，如唯一约束 23505） */
export function getPgErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) return undefined;
    const e = error as ErrorWithPgCode;
    const code = e.cause?.code ?? e.code;
    return typeof code === 'string' ? code : undefined;
};

/** 服务端统一错误日志：保留 message 与 stack，不返回给客户端 */
export function logServerError(message: string, error: unknown): void {
    logger.error(message, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        code: getPgErrorCode(error),
        httpStatus: getHttpStatus(error),
    });
};