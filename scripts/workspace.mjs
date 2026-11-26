/**
 * 多项目托管脚本：按 workspace.json 清单一键安装 / 打包 / 开发
 *
 * 用法（仓库根目录）:
 *   node scripts/workspace.mjs <install|build|dev|list> [项目名...] [--force]
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const [action, ...rest] = process.argv.slice(2);
const force = rest.includes('--force');
const names = rest.filter((a) => !a.startsWith('--'));
const COLORS = [36, 33, 35, 32, 34, 31];

function fail(msg) {
    console.error(`[workspace] ${msg}`);
    process.exit(1);
};

/** 读取并校验清单 */
function loadProjects() {
    const file = resolve(root, 'workspace.json');
    if (!existsSync(file)) fail('缺少 workspace.json');
    let list;
    try { list = JSON.parse(readFileSync(file, 'utf-8')).projects; } catch (e) { fail(`workspace.json 解析失败: ${e.message}`); }
    if (!Array.isArray(list)) fail('workspace.json 缺少 projects 数组');
    const seen = new Set();
    list.forEach((p, i) => {
        if (!p.name || !p.dir) fail(`projects[${i}] 缺少 name 或 dir`);
        if (seen.has(p.name)) fail(`项目名重复: ${p.name}`);
        seen.add(p.name);
        if (p.enabled !== false && !existsSync(resolve(root, p.dir))) fail(`项目 ${p.name} 的目录不存在: ${p.dir}`);
    });
    list.forEach((p, i) => { p.color = COLORS[i % COLORS.length]; });
    return list;
};

const all = loadProjects();
for (const n of names) if (!all.some((p) => p.name === n)) fail(`清单中没有项目: ${n}`);
const projects = all.filter((p) => p.enabled !== false && (!names.length || names.includes(p.name)));

/** 带前缀输出子进程日志 */
function pipePrefixed(stream, out, tag) {
    let buf = '';
    stream.on('data', (d) => {
        buf += d.toString();
        const lines = buf.split(/\r?\n/);
        buf = lines.pop();
        lines.forEach((l) => out.write(`${tag} ${l}\n`));
    });
    stream.on('end', () => { if (buf) out.write(`${tag} ${buf}\n`); });
};

/** 在项目目录执行命令，返回退出码 */
function run(p, cmd) {
    return new Promise((done) => {
        const tag = `\x1b[${p.color}m[${p.name}]\x1b[0m`;
        const child = spawn(cmd, { cwd: resolve(root, p.dir), shell: true, env: process.env });
        pipePrefixed(child.stdout, process.stdout, tag);
        pipePrefixed(child.stderr, process.stderr, tag);
        child.on('close', (code) => done(code ?? 1));
        p.child = child;
    });
};

/** lockfile 未变化且 node_modules 存在时无需重装 */
function installUpToDate(p) {
    const dir = resolve(root, p.dir);
    const nm = resolve(dir, 'node_modules');
    if (!existsSync(nm)) return false;
    if (!p.lockfile) return false;
    const lock = resolve(dir, p.lockfile);
    if (!existsSync(lock)) return false;
    return statSync(lock).mtimeMs <= statSync(nm).mtimeMs;
};

/** 串行执行 install / build，失败不中断，最后汇总 */
async function runSerial(key, label) {
    const results = [];
    for (const p of projects) {
        const cmd = p[key];
        if (!cmd) { results.push([p.name, 'skip', '未配置命令']); continue; }
        if (key === 'install' && !force && installUpToDate(p)) { results.push([p.name, 'skip', '依赖已是最新']); continue; }
        console.log(`\n== ${label} ${p.name}: ${cmd}`);
        const code = await run(p, cmd);
        results.push([p.name, code === 0 ? 'ok' : 'fail', code === 0 ? '' : `退出码 ${code}`]);
    }
    console.log(`\n== ${label}结果`);
    results.forEach(([n, s, m]) => console.log(`  ${s === 'ok' ? '成功' : s === 'skip' ? '跳过' : '失败'}  ${n}${m ? `  (${m})` : ''}`));
    if (results.some((r) => r[1] === 'fail')) process.exit(1);
};

/** 并行启动所有项目的 dev */
function runDev() {
    const targets = projects.filter((p) => p.dev);
    if (!targets.length) fail('没有配置 dev 命令的项目');
    const stop = () => targets.forEach((p) => p.child?.kill());
    process.on('SIGINT', () => { stop(); process.exit(0); });
    targets.forEach((p) => {
        console.log(`== dev ${p.name}: ${p.dev}`);
        run(p, p.dev).then((code) => console.log(`[workspace] ${p.name} 已退出，退出码 ${code}`));
    });
};

switch (action) {
    case 'install': await runSerial('install', '安装'); break;
    case 'build': await runSerial('build', '打包'); break;
    case 'dev': runDev(); break;
    case 'list':
        all.forEach((p) => console.log(`${p.enabled === false ? '[禁用]' : '[启用]'} ${p.name}  dir=${p.dir}  install=${p.install ?? '-'}  build=${p.build ?? '-'}  dev=${p.dev ?? '-'}`));
        break;
    default: fail('用法: node scripts/workspace.mjs <install|build|dev|list> [项目名...] [--force]');
};