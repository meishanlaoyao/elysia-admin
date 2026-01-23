import { Context } from 'elysia';
import { GetClientIp, GetClientOs, GetClientPlatform, GetClientType, GetIpLocation } from '@/utils/ip';
import { InsertLoginLog } from '@/routes/system-login-log/handle';

// 获取客户端信息
async function getClientInfo(ctx: Context): Promise<{
    ipaddr: string;
    userAgent: string;
    loginLocation: string;
    clientType: string;
    clientPlatform: string;
    os: string;
} | null> {
    try {
        const ipaddr = GetClientIp(ctx.request, ctx.server);
        const userAgent = ctx.headers['user-agent'] || '';
        const loginLocation = await GetIpLocation(ipaddr);
        const clientType = GetClientType(userAgent);
        const clientPlatform = GetClientPlatform(userAgent);
        const os = GetClientOs(userAgent);
        return { ipaddr, userAgent, loginLocation, clientType, clientPlatform, os };
    } catch (error) {
        console.error('获取客户端信息失败:', error);
        return null;
    }
};

/**
 * 添加登陆日志
 */
export async function AddLoginLog(ctx: Context) {
    try {
        const clientInfo = await getClientInfo(ctx);
        if (!clientInfo) return;
        const userId = (ctx.headers as any)?.userId || null;
        const res = (ctx as any)?.response || {};
        InsertLoginLog({ ...clientInfo, userId, loginType: 'admin', message: res?.msg, status: res.code === 200, createBy: userId });
    }
    catch (error) {
        console.error('添加登陆日志失败:', error);
    }
};