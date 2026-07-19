import { appendFileSync, createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Writable } from 'node:stream';

/** 本地日期戳 YYYYMMDD */
export function todayStamp(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
};

function getEntryPath(): string {
    return resolve(process.argv[1] || '');
};

/** cwd 是否为已部署的 dist（含 production.yaml；build 脚本的 server/ 根不会命中） */
function isDeployedDistCwd(): boolean {
    return (process.env.NODE_ENV || '') === 'production'
        && existsSync(join(process.cwd(), 'production.yaml'));
};

/**
 * 解析 dist 根目录，保证日志落在 dist/logs
 * - dist/index.js | workers.js | processors/*.js
 * - BullMQ 沙箱 bootstrap：dist/dist/cjs/... → 回退 cwd（PM2 下为 dist）
 */
export function getDistRoot(): string | null {
    const entry = getEntryPath();
    const main = entry.match(/^(.*[\\/]dist)[\\/](?:index|workers)\.js$/i);
    if (main) return main[1];
    const proc = entry.match(/^(.*[\\/]dist)[\\/]processors[\\/]/i);
    if (proc) return proc[1];
    // dist/dist/cjs/...（BullMQ 复制的 sandbox bootstrap）
    const nested = entry.match(/^(.*[\\/]dist)[\\/]dist[\\/]/i);
    if (nested) return nested[1];
    if (isDeployedDistCwd()) return process.cwd();
    return null;
};

/** 是否从 dist 入口 / 沙箱 / 已部署 cwd 启动（排除 build 等脚本误写文件） */
export function isDistRuntime(): boolean {
    const entry = getEntryPath();
    if (/[\\/]dist[\\/](?:index|workers)\.js$/i.test(entry)) return true;
    if (/[\\/]dist[\\/]processors[\\/].+\.js$/i.test(entry)) return true;
    if (/[\\/]dist[\\/]dist[\\/]cjs[\\/]/i.test(entry)) return true;
    // 沙箱子进程入口可能落在 node_modules/bullmq，用部署目录判定
    if (isDeployedDistCwd()) return true;
    return false;
};

/** 是否为 BullMQ 沙箱 processor 相关（入口或已标 APP_ROLE） */
export function isProcessorRuntime(): boolean {
    const entry = getEntryPath();
    return /[\\/]dist[\\/]processors[\\/].+\.js$/i.test(entry)
        || /[\\/]dist[\\/]dist[\\/]cjs[\\/]/i.test(entry);
};

/** Worker 进程或 processor 子进程 */
export function isWorkerRole(): boolean {
    return process.env.APP_ROLE === 'worker' || isProcessorRuntime();
};

/** 生产日志根目录：始终锚定 dist/logs */
export function getLogDir(): string {
    const distRoot = getDistRoot();
    if (distRoot) return join(distRoot, 'logs');
    return join(process.cwd(), 'logs');
};

/**
 * 启动失败 / 未捕获异常同步落盘（不依赖 pino，可在 config 加载阶段使用）
 */
export function appendFatalLog(message: string): void {
    const text = String(message);
    if (!isDistRuntime() && !isDeployedDistCwd()) {
        console.error(text);
        return;
    };
    try {
        const dir = join(getLogDir(), todayStamp());
        mkdirSync(dir, { recursive: true });
        const file = isWorkerRole() ? 'worker-error.log' : 'error.log';
        appendFileSync(join(dir, file), `${new Date().toISOString()} [FATAL] ${text}\n`, 'utf-8');
    } catch (e) {
        console.error(text);
        console.error('[appendFatalLog] 写文件失败:', e instanceof Error ? e.message : String(e));
    };
};

/**
 * 按日滚动写入流：路径为 {baseDir}/{YYYYMMDD}/{fileName}
 * 跨零点自动切到新日期目录
 */
export class DailyRotatingStream extends Writable {
    private readonly baseDir: string;
    private readonly fileName: string;
    private currentDate = '';
    private stream: ReturnType<typeof createWriteStream> | null = null;

    constructor(baseDir: string, fileName: string) {
        super();
        this.baseDir = baseDir;
        this.fileName = fileName;
        this.ensureStream();
    };

    private ensureStream(): void {
        const date = todayStamp();
        if (this.stream && this.currentDate === date) return;
        if (this.stream) {
            this.stream.end();
            this.stream = null;
        };
        const dir = join(this.baseDir, date);
        mkdirSync(dir, { recursive: true });
        this.stream = createWriteStream(join(dir, this.fileName), { flags: 'a' });
        this.currentDate = date;
    };

    _write(
        chunk: Buffer | string,
        encoding: BufferEncoding,
        callback: (error?: Error | null) => void,
    ): void {
        try {
            this.ensureStream();
            this.stream!.write(chunk, encoding, callback);
        } catch (e) {
            callback(e instanceof Error ? e : new Error(String(e)));
        };
    };

    _final(callback: (error?: Error | null) => void): void {
        if (this.stream) {
            this.stream.end(callback);
            this.stream = null;
        } else {
            callback();
        };
    };

    flushSync(): void {
        try {
            (this.stream as unknown as { flushSync?: () => void })?.flushSync?.();
        } catch {
            // ignore
        };
    };
};
