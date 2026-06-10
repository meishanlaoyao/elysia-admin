import { Context } from 'elysia';
import { LogLevel } from "@/constants/enum";
import Colors from "@/shared/color";
import type { LastVersionPayload } from "@/types/last-version";

const LAST_VERSION_JSON_URL = 'https://elysia-admin.top/last-version.json';
const STARTUP_TITLE_VERSION_GAP = 1;
const LAST_VERSION_FETCH_TIMEOUT_MS = 2000;

const STARTUP_REMOTE_DESC_MAX = 100;
const STARTUP_REMOTE_URL_MAX = 76;

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

function printStartupBanner(config: {
    titleLine: string;
    baseUrl: string;
    env: string;
    pid: number;
    bunVersion?: string;
    openApiEnabled?: boolean;
}): void {
    const { titleLine, baseUrl, env, pid, bunVersion, openApiEnabled } = config;
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

class Logger {
    private formatMessage(level: LogLevel, message: string, meta?: Record<string, any>): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${Colors.gray}[${timestamp}]${Colors.reset} [${level}] ${message}${metaStr}`;
    }

    info(message: string, meta?: Record<string, any>): void {
        console.log(`${Colors.blue}${this.formatMessage(LogLevel.INFO, message, meta)}${Colors.reset}`);
    }

    success(message: string): void {
        console.log(`${Colors.green}${message}${Colors.reset}`);
    }

    warn(message: string, meta?: Record<string, any>): void {
        console.warn(`${Colors.yellow}${this.formatMessage(LogLevel.WARN, message, meta)}${Colors.reset}`);
    }

    error(message: string, meta?: Record<string, any>): void {
        console.error(`${Colors.red}${this.formatMessage(LogLevel.ERROR, message, meta)}${Colors.reset}`);
    }

    debug(message: string, meta?: Record<string, any>): void {
        console.debug(`${Colors.gray}${this.formatMessage(LogLevel.DEBUG, message, meta)}${Colors.reset}`);
    }

    group(title: string): void {
        console.log(`\n${Colors.cyan}${'─'.repeat(60)}`);
        console.log(`  ${title}`);
        console.log(`${'─'.repeat(60)}${Colors.reset}`);
    };

    async logStartup(config: {
        appId: string;
        port: number | string;
        prefix: string;
        env: string;
        pid: number;
        appVersion?: string;
        openApiEnabled?: boolean;
        bunVersion?: string;
    }): Promise<void> {
        const { appId, port, prefix, env, pid, openApiEnabled, bunVersion, appVersion } = config;
        const baseUrl = `http://localhost:${port}${prefix}`;
        const { titleLine, remoteInfo } = await resolveStartupTitle(
            `🚀 ${appId} 启动成功`,
            env,
            appVersion,
            (msg) => this.debug('官方版本信息拉取失败: ' + msg),
        );
        printStartupBanner({ titleLine, baseUrl, env, pid, bunVersion, openApiEnabled });
        if (remoteInfo) logStartupRemoteSummary(remoteInfo);
    }

    logRequest(ctx: Context) {
        const { path, request, startTime, response, set } = ctx as any;
        const duration = Date.now() - startTime;
        const method = request.method;
        const code = response?.code || set?.status || 500;
        let statusColor = Colors.green;
        if (code >= 500) statusColor = Colors.red;
        else if (code >= 400) statusColor = Colors.yellow;
        else if (code >= 300) statusColor = Colors.cyan;
        let methodColor = Colors.blue;
        if (method === 'POST') methodColor = Colors.green;
        else if (method === 'PUT') methodColor = Colors.yellow;
        else if (method === 'DELETE') methodColor = Colors.red;
        else if (method === 'PATCH') methodColor = Colors.magenta;
        let durationColor = Colors.green;
        if (duration > 1000) durationColor = Colors.red;
        else if (duration > 500) durationColor = Colors.yellow;
        this.debug(
            `${methodColor}${method.padEnd(7)}${Colors.reset} ` +
            `${statusColor}${code}${Colors.reset} ` +
            `${Colors.bright}${path}${Colors.reset} ` +
            `${durationColor}${duration}ms${Colors.reset}`
        );
    }
};

export const logger = new Logger();