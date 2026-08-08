/**
 * 开发态守护：监听 src/modules 目录集合变化，稳定后 touch modules/index.ts，
 * 让 bun --watch 自行重载（新建模块目录本不在模块图中，原生 watcher 感知不到）。
 */
import { existsSync, readdirSync, statSync, utimesSync } from 'node:fs';
import { join } from 'node:path';

const POLL_MS = 1000;
const STABLE_MS = 5000;
const RECENT_WINDOW_MS = 30_000;

const serverRoot = join(import.meta.dir, '..');
const modulesPath = join(serverRoot, 'src', 'modules');
const touchTarget = join(modulesPath, 'index.ts');

type ModuleSnapshot = {
    /** 完整指纹：目录名 + 文件名 + mtime */
    fingerprint: string;
    /** 仅目录名集合（排序后） */
    dirs: string[];
    /** 各目录内部指纹，用于慢写兜底比对 */
    dirFingerprints: Map<string, string>;
};

function snapshotModules(): ModuleSnapshot {
    const dirFingerprints = new Map<string, string>();
    const dirs: string[] = [];
    if (!existsSync(modulesPath)) return { fingerprint: '', dirs, dirFingerprints };
    const entries = readdirSync(modulesPath);
    for (const entry of entries) {
        if (entry === 'index.ts') continue;
        const fullPath = join(modulesPath, entry);
        let isDir = false;
        try {
            isDir = statSync(fullPath).isDirectory();
        } catch {
            continue;
        }
        if (!isDir) continue;
        dirs.push(entry);
        let files: string[] = [];
        try {
            files = readdirSync(fullPath).sort();
        } catch {
            files = [];
        }
        const parts: string[] = [entry];
        for (const file of files) {
            const filePath = join(fullPath, file);
            try {
                const st = statSync(filePath);
                if (st.isFile()) {
                    parts.push(`${file}:${st.mtimeMs}`);
                }
            } catch {
                // ignore transient read errors while files are being written
            }
        }
        dirFingerprints.set(entry, parts.join('|'));
    }
    dirs.sort();
    const fingerprint = dirs.map((d) => dirFingerprints.get(d) ?? d).join('\n');
    return { fingerprint, dirs, dirFingerprints };
}

function diffDirs(prev: string[], next: string[]): { added: string[]; removed: string[] } {
    const prevSet = new Set(prev);
    const nextSet = new Set(next);
    const added = next.filter((d) => !prevSet.has(d));
    const removed = prev.filter((d) => !nextSet.has(d));
    return { added, removed };
}

function touchModulesIndex() {
    if (!existsSync(touchTarget)) {
        console.warn('[dev-watch] 未找到 src/modules/index.ts，跳过 touch');
        return;
    }
    const now = new Date();
    utimesSync(touchTarget, now, now);
}

function formatChange(added: string[], removed: string[]): string {
    const parts: string[] = [];
    for (const d of added) parts.push(`+${d}`);
    for (const d of removed) parts.push(`-${d}`);
    return parts.join(', ');
}

const child = Bun.spawn([process.execPath, '--watch', 'src/index.ts'], {
    cwd: serverRoot,
    env: { ...process.env, NODE_ENV: 'development' },
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
});

let baseline = snapshotModules();
let lastFingerprint = baseline.fingerprint;
let stableSince = Date.now();
let pendingStable: ModuleSnapshot | null = null;
/** 新出现目录 → 首次纳入基线的时间戳 */
const recentlyAdded = new Map<string, number>();

const timer = setInterval(() => {
    const now = Date.now();
    // 清理过期的慢写窗口
    for (const [dir, ts] of recentlyAdded) {
        if (now - ts > RECENT_WINDOW_MS) recentlyAdded.delete(dir);
    }
    const current = snapshotModules();
    if (current.fingerprint !== lastFingerprint) {
        lastFingerprint = current.fingerprint;
        stableSince = now;
        pendingStable = current;
        return;
    }
    if (!pendingStable) return;
    if (now - stableSince < STABLE_MS) return;
    const stable = pendingStable;
    pendingStable = null;
    const { added, removed } = diffDirs(baseline.dirs, stable.dirs);
    let shouldTouch = added.length > 0 || removed.length > 0;

    // 慢写兜底：新目录窗口内内部指纹相对基线再变化 → 再 touch
    if (!shouldTouch && recentlyAdded.size > 0) {
        for (const dir of recentlyAdded.keys()) {
            if (!stable.dirs.includes(dir)) continue;
            const prevFp = baseline.dirFingerprints.get(dir);
            const nextFp = stable.dirFingerprints.get(dir);
            if (prevFp !== undefined && nextFp !== undefined && prevFp !== nextFp) {
                shouldTouch = true;
                console.log(`[dev-watch] ⟳ 新模块 ${dir} 内容已稳定补齐，正在重载...`);
                break;
            }
        }
    }
    if (shouldTouch && (added.length > 0 || removed.length > 0)) {
        console.log(`[dev-watch] ⟳ 检测到模块变更：${formatChange(added, removed)}，正在重载...`);
    }
    if (shouldTouch) {
        touchModulesIndex();
    }
    for (const dir of added) {
        recentlyAdded.set(dir, now);
    }
    for (const dir of removed) {
        recentlyAdded.delete(dir);
    }
    // 目录集合不变时也要推进基线内部指纹，便于下一次慢写比对
    baseline = stable;
}, POLL_MS);

const exitCode = await child.exited;
clearInterval(timer);
process.exit(exitCode);