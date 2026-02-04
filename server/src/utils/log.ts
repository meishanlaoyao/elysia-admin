import { Context } from 'elysia';
import { GetClientIp, GetClientOs, GetClientPlatform, GetClientType, GetIpLocation } from '@/utils/ip';

/**
 * 获取客户端信息
 * @param ctx 请求上下文
 * @returns 客户端信息
 */
export async function GetClientInfo(ctx: Context): Promise<{
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