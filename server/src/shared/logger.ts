import { Context } from 'elysia';
import pino, { type Logger as PinoLogger } from 'pino';
import config from '@/config';
import Colors from '@/shared/color';
import {
    DailyRotatingStream,
    appendFatalLog,
    getLogDir,
    isDistRuntime,
    isWorkerRole,
} from '@/shared/log-stream';
import type { LastVersionPayload } from '@/types/last-version';

export { appendFatalLog } from '@/shared/log-stream';

const LAST_VERSION_JSON_URL = 'https://elysia-admin.top/last-version.json';
const STARTUP_TITLE_VERSION_GAP = 1;
const LAST_VERSION_FETCH_TIMEOUT_MS = 2000;

const STARTUP_REMOTE_DESC_MAX = 100;
const STARTUP_REMOTE_URL_MAX = 76;

const isProduction = (process.env.NODE_ENV || 'development') === 'production';
const isWorker = isWorkerRole();
/** 仅 dist 运行时写文件；build 脚本等 production 上下文走 stdout */
const useFileLogs = isProduction && isDistRuntime();
const logLevel = config.log.level;
const showRequestParams = config.log.showRequestParams;

const fileStreams: DailyRotatingStream[] = [];

function collapseOneLine(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
};

function truncateUtf(s: string, max: number): string {
    if (s.length <= max) return s;
    return s.slice(0, Math.max(1, max - 1)) + '…';
};

function compareSemver(a: string, b: string): number | null {
    const norm = (s: string) => s.trim().replace(/^v/i, '');
    const pa = norm(a).split('.');
    const pb = norm(b).split('.');
    const n = Math.max(pa.length, pb.length);
    for (let i = 0; i < n; i++) {
        const na = parseInt(String(pa[i] ?? '0').replace(/(\d+).*/, '$1'), 10);
        const nb = parseInt(String(pb[i] ?? '0').replace(/(\d+).*/, '$1'), 10);
        if (Number.isNaN(na) || Number.isNaN(nb)) return null;
        if (na !== nb) return na < nb ? -1 : 1;
    };
    return 0;
};

function joinStartupTitle(left: string, right: string): string {
    return left + ' '.repeat(STARTUP_TITLE_VERSION_GAP) + right;
};

function logStartupRemoteSummary(remote: LastVersionPayload): void {
    const verRaw = remote.version.trim().replace(/^v/i, '');
    const date = remote.publishDate?.trim();
    const descRaw = remote.description?.trim();
    const desc = descRaw ? truncateUtf(collapseOneLine(descRaw), STARTUP_REMOTE_DESC_MAX) : '';
    const force = remote.forceUpdate === true;
    const url = remote.changelogUrl?.trim();
    let line =
        `${Colors.bright}最新版本${Colors.reset} ` +
        `${Colors.startupVersion}v${verRaw}${Colors.reset}`;
    if (date) line += `${Colors.dim}（${date}）${Colors.reset}`;
    if (desc) line += `${Colors.dim}，${desc}${Colors.reset}`;
    if (force) line += `${Colors.red}，建议强制更新${Colors.reset}`;
    if (url) line += `${Colors.dim}版本更新详情可查看：${truncateUtf(url, STARTUP_REMOTE_URL_MAX)}${Colors.reset}`;
    console.log(line);
};

function startupVersionTag(ver: string): string {
    return `${Colors.startupVersion}v${ver}${Colors.reset}`;
};

function formatStartupVersionRight(appVersion: string, remoteVersion: string | null): string {
    const tag = startupVersionTag;
    if (!remoteVersion) return tag(appVersion);
    const cmp = compareSemver(appVersion, remoteVersion);
    if (cmp === 0 || appVersion === remoteVersion) return tag(appVersion);
    if (cmp === null) {
        if (appVersion === remoteVersion) return tag(appVersion);
        if (appVersion < remoteVersion) {
            return `${tag(appVersion)} ${Colors.startupVersionArrowUp}↑${Colors.reset} ${tag(remoteVersion)}`;
        }
        return `${tag(appVersion)} ${Colors.startupVersionArrowDown}↓${Colors.reset} ${tag(remoteVersion)}`;
    }
    if (cmp < 0) {
        return `${tag(appVersion)} ${Colors.startupVersionArrowUp}↑${Colors.reset} ${tag(remoteVersion)}`;
    }
    return `${tag(appVersion)} ${Colors.startupVersionArrowDown}↓${Colors.reset} ${tag(remoteVersion)}`;
};

async function fetchLastVersionInfo(onFetchError: (message: string) => void): Promise<LastVersionPayload | null> {
    try {
        const res = await fetch(LAST_VERSION_JSON_URL, { signal: AbortSignal.timeout(LAST_VERSION_FETCH_TIMEOUT_MS) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Partial<LastVersionPayload>;
        if (typeof data.version !== 'string' || data.version.length === 0) return null;
        return {
            version: data.version,
            publishDate: typeof data.publishDate === 'string' ? data.publishDate.trim() : undefined,
            description: typeof data.description === 'string' ? data.description : undefined,
            changelogUrl: typeof data.changelogUrl === 'string' ? data.changelogUrl.trim() : undefined,
            forceUpdate: data.forceUpdate === true,
        };
    } catch (e) {
        onFetchError(e instanceof Error ? e.message : String(e));
        return null;
    }
};

async function resolveStartupTitle(
    left: string,
    env: string,
    appVersion: string | undefined,
    onFetchError: (message: string) => void,
): Promise<{ titleLine: string; remoteInfo: LastVersionPayload | null }> {
    if (env === 'production' || appVersion === undefined) {
        return { titleLine: left, remoteInfo: null };
    }
    const remoteInfo = await fetchLastVersionInfo(onFetchError);
    const right = formatStartupVersionRight(appVersion, remoteInfo?.version ?? null);
    return { titleLine: joinStartupTitle(left, right), remoteInfo };
};

function printStartupBanner(banner: {
    titleLine: string;
    baseUrl: string;
    env: string;
    pid: number;
    bunVersion?: string;
    openApiEnabled?: boolean;
}): void {
    const { titleLine, baseUrl, env, pid, bunVersion, openApiEnabled } = banner;
    console.log('\n' + '='.repeat(60));
    console.log(titleLine);
    console.log('='.repeat(60) + Colors.reset);
    console.log(`${Colors.bright}服务地址:${Colors.reset}     ${Colors.cyan}${baseUrl}${Colors.reset}`);
    if (openApiEnabled) {
        console.log(`${Colors.bright}API文档:${Colors.reset}      ${Colors.cyan}${baseUrl}/openapi${Colors.reset}`);
        console.log(`${Colors.bright}OpenAPI JSON:${Colors.reset} ${Colors.cyan}${baseUrl}/openapi/json${Colors.reset}`);
    };
    console.log(`${Colors.bright}启动时间:${Colors.reset}     ${new Date().toLocaleString('zh-CN')}`);
    console.log(`${Colors.bright}运行环境:${Colors.reset}     ${env === 'production' ? Colors.red : Colors.yellow}${env}${Colors.reset}`);
    console.log(`${Colors.bright}Bun版本:${Colors.reset}      ${bunVersion || 'N/A'}`);
    console.log(`${Colors.bright}进程ID:${Colors.reset}       ${pid}`);
    console.log('='.repeat(60) + Colors.reset);
};

function createAppLogger(): PinoLogger {
    const base = {
        level: logLevel,
        timestamp: pino.stdTimeFunctions.isoTime,
        base: { pid: process.pid },
    };

    if (!useFileLogs) {
        if (!isProduction) {
            const pretty = require('pino-pretty') as typeof import('pino-pretty');
            const stream = pretty({
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            });
            return pino(base, stream);
        }
        // production 但非 dist 运行时（如 build 脚本）：直写 stdout
        return pino(base);
    }

    const logDir = getLogDir();
    const appFile = isWorker ? 'worker.log' : 'app.log';
    const errFile = isWorker ? 'worker-error.log' : 'error.log';
    const appStream = new DailyRotatingStream(logDir, appFile);
    const errStream = new DailyRotatingStream(logDir, errFile);
    fileStreams.push(appStream, errStream);
    return pino(
        base,
        pino.multistream(
            [
                { level: logLevel as pino.Level, stream: appStream },
                // warn + error 进错误文件，info 留在 app/worker（dedupe）
                { level: 'warn', stream: errStream },
            ],
            { dedupe: true },
        ),
    );
};

function createHttpLogger(appLogger: PinoLogger): PinoLogger {
    if (!useFileLogs || isWorker) return appLogger;
    const httpStream = new DailyRotatingStream(getLogDir(), 'http.log');
    fileStreams.push(httpStream);
    return pino(
        {
            level: 'info',
            timestamp: pino.stdTimeFunctions.isoTime,
            base: { pid: process.pid },
        },
        httpStream,
    );
};

const appLogger = createAppLogger();
const httpLogger = createHttpLogger(appLogger);

/** 进程退出前尽量刷盘，避免致命错误丢失最后几行 */
export function flushLogs(): void {
    try {
        (appLogger as unknown as { flush?: () => void }).flush?.();
        (httpLogger as unknown as { flush?: () => void }).flush?.();
        for (const s of fileStreams) s.flushSync();
    } catch {
        // ignore
    };
};

function write(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    meta?: Record<string, any>,
): void {
    if (meta && Object.keys(meta).length > 0) {
        appLogger[level](meta, message);
    } else {
        appLogger[level](message);
    }
};

class Logger {
    info(message: string, meta?: Record<string, any>): void {
        write('info', message, meta);
    }

    success(message: string): void {
        appLogger.info(message);
    }

    warn(message: string, meta?: Record<string, any>): void {
        write('warn', message, meta);
    }

    error(message: string, meta?: Record<string, any>): void {
        write('error', message, meta);
    }

    debug(message: string, meta?: Record<string, any>): void {
        write('debug', message, meta);
    }

    group(title: string): void {
        appLogger.info(`── ${title} ──`);
    };

    async logStartup(startup: {
        appId: string;
        port: number | string;
        prefix: string;
        env: string;
        pid: number;
        appVersion?: string;
        openApiEnabled?: boolean;
        bunVersion?: string;
    }): Promise<void> {
        const { appId, port, prefix, env, pid, openApiEnabled, bunVersion, appVersion } = startup;
        const baseUrl = `http://localhost:${port}${prefix}`;
        const { titleLine, remoteInfo } = await resolveStartupTitle(
            `🚀 ${appId} 启动成功`,
            env,
            appVersion,
            (msg) => this.debug('官方版本信息拉取失败: ' + msg),
        );
        // 终端彩色横幅；文件日志模式下额外写一条结构化启动摘要到 app.log
        printStartupBanner({ titleLine, baseUrl, env, pid, bunVersion, openApiEnabled });
        if (remoteInfo) logStartupRemoteSummary(remoteInfo);
        if (useFileLogs) {
            this.info(`${appId} 启动成功`, {
                baseUrl,
                env,
                pid,
                bunVersion: bunVersion || 'N/A',
                openApiEnabled: !!openApiEnabled,
                ...(appVersion !== undefined ? { appVersion } : {}),
            });
        }
    }

    logRequest(ctx: Context) {
        const { path, request, startTime, response, set, query, body, params } = ctx as any;
        const duration = Date.now() - (startTime || Date.now());
        const method = request?.method || 'GET';
        const code = response?.code || set?.status || 500;
        const fields: Record<string, any> = {
            method,
            path,
            status: code,
            duration,
        };
        if (showRequestParams) {
            if (query !== undefined) fields.query = query;
            if (body !== undefined) fields.body = body;
            if (params !== undefined) fields.params = params;
        }
        httpLogger.info(fields, `${method} ${path} ${code} ${duration}ms`);
    }
};

export const logger = new Logger();