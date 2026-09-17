import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import net from 'node:net';
import os from 'node:os';

const PROBE_HOST = 'elysia-admin.top';
const PROBE_PORT = 443;
const PROBE_TIMEOUT_MS = 3000;

export type DualStackMode = 'ipv4_only' | 'ipv6_only' | 'dual';

export type DualStackProbeResult =
    | { ok: true; mode: DualStackMode; message: string }
    | { ok: false; mode: 'half_broken' | 'none'; message: string };

type FamilyReach = 'ok' | 'absent' | 'blackhole';

/**
 * 是否存在全局 IPv6 地址（排除链路本地 fe80: 与回环）
 */
function HasGlobalIpv6(): boolean {
    const ifaces = os.networkInterfaces();
    for (const entries of Object.values(ifaces)) {
        if (!entries) continue;
        for (const e of entries) {
            if (e.family !== 'IPv6') continue;
            const addr = e.address.toLowerCase();
            if (addr.startsWith('fe80:') || addr === '::1') continue;
            return true;
        };
    };
    return false;
};

/**
 * 探测单协议族出网可达性。
 * 使用 dns.lookup（系统解析，与 fetch 一致），避免 resolve4/6 走独立 DNS 在部分 Windows 上 ECONNREFUSED 误判。
 * @param family 4 或 6
 * @returns ok=栈可达；absent=无该族记录/栈；blackhole=超时/黑洞
 */
async function ProbeFamily(family: 4 | 6): Promise<FamilyReach> {
    let ip: string;
    try {
        const looked = await dnsPromises.lookup(PROBE_HOST, { family });
        ip = looked.address;
    } catch (e) {
        const err = e as NodeJS.ErrnoException;
        // 无 A/AAAA 或系统无该族 → 视为该族不存在（不是半残）
        if (
            err.code === 'ENOTFOUND'
            || err.code === 'ENODATA'
            || err.code === 'EAI_ADDRFAMILY'
            || err.code === 'EAFNOSUPPORT'
        ) {
            return 'absent';
        };
        return 'blackhole';
    };
    return await new Promise<FamilyReach>((resolve) => {
        const socket = net.connect({ host: ip, port: PROBE_PORT, family });
        let settled = false;
        const finish = (status: FamilyReach) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            socket.removeAllListeners();
            socket.destroy();
            resolve(status);
        };
        const timer = setTimeout(() => finish('blackhole'), PROBE_TIMEOUT_MS);
        socket.once('connect', () => finish('ok'));
        socket.once('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'ECONNREFUSED') {
                finish('ok');
                return;
            }
            if (err.code === 'ENETUNREACH' || err.code === 'EADDRNOTAVAIL' || err.code === 'EAFNOSUPPORT') {
                finish('absent');
                return;
            }
            finish('blackhole');
        });
    });
};

/**
 * 启动前探测公网双栈出网：仅允许「仅 IPv4 / 仅 IPv6 / 双栈全通」。
 * 分族短超时 TCP，避免默认 fetch 优先 AAAA 被黑洞拖死。
 * @returns 探测结果；失败时含运维指引文案
 */
export async function ProbeOutboundDualStack(): Promise<DualStackProbeResult> {
    const [ipv4, ipv6] = await Promise.all([ProbeFamily(4), ProbeFamily(6)]);
    const hasGlobalV6 = HasGlobalIpv6();
    if (ipv4 === 'ok' && ipv6 === 'ok') {
        return { ok: true, mode: 'dual', message: '网络探测通过：双栈' };
    };
    if (ipv4 === 'ok' && ipv6 === 'absent') {
        return { ok: true, mode: 'ipv4_only', message: '网络探测通过：仅IPv4' };
    };
    if (ipv6 === 'ok' && ipv4 === 'absent') {
        return { ok: true, mode: 'ipv6_only', message: '网络探测通过：仅IPv6' };
    };
    if ((ipv4 === 'ok' && ipv6 === 'blackhole') || (ipv6 === 'ok' && ipv4 === 'blackhole')) {
        const detail = ipv4 === 'ok'
            ? 'IPv4 通、IPv6 公网不通'
            : 'IPv6 通、IPv4 公网不通';
        const ifaceHint = hasGlobalV6 && ipv6 === 'blackhole' ? '（本机已有全局 IPv6 地址）' : '';
        return {
            ok: false,
            mode: 'half_broken',
            message:
                `检测到半残双栈（${detail}）${ifaceHint}。请关闭主机 IPv6 或修复公网双栈后再启动；紧急可用 SKIP_NETWORK_PROBE=1 跳过`,
        };
    };
    return {
        ok: false,
        mode: 'none',
        message:
            `公网 IPv4/IPv6 均不可达（ipv4=${ipv4}, ipv6=${ipv6}），请检查出网与 DNS；无公网出网环境请设 SKIP_NETWORK_PROBE=1`,
    };
};

/**
 * 按探测通过态设置 DNS 结果优先序（辅助；个别旧版 Bun 对 fetch 可能仍忽略）
 * @param mode 通过态
 */
export function ApplyDnsResultOrder(mode: DualStackMode): void {
    try {
        if (mode === 'ipv6_only') {
            dns.setDefaultResultOrder('ipv6first');
        } else {
            dns.setDefaultResultOrder('ipv4first');
        };
    } catch {
        // 运行时不支持时忽略
    }
};