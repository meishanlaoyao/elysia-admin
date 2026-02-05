import { Context } from 'elysia';
import { logger } from '@/shared/logger';
import type { IClientType, IClientPlatform } from '@/types/common';

/**
 * 检查 IP 是否为内网地址
 * @param ip IP 地址
 * @returns 
 */
export function IsPrivateIp(ip: string) {
    return (
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        ip.startsWith('172.16.') ||
        ip.startsWith('172.17.') ||
        ip.startsWith('172.18.') ||
        ip.startsWith('172.19.') ||
        ip.startsWith('172.2') // 172.20 - 172.31
    );
};

/**
 * 标准化 IP 地址
 * @param ip IP 地址
 * @returns 
 */
export function NormalizeIp(ip: string) {
    if (ip?.startsWith('::ffff:')) {
        return ip.replace('::ffff:', '');
    };
    return ip;
};

/**
 * 获取客户端 IP 地址
 * @param request 请求对象
 * @param server 服务器对象
 * @returns 客户端 IP 地址
 */
export function GetClientIp(request: Request, server: Bun.Server<unknown> | null) {
    const xff = request.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    const xReal = request.headers.get('x-real-ip');
    if (xReal) return xReal;
    const ip = server?.requestIP(request)?.address;
    return ip ? NormalizeIp(ip) : '未知';
};

/**
 * 查询 IP 地址的地区信息
 * @param ip IP 地址
 * @returns IP 地址的地区信息
 */
export async function GetIpLocation(ip: string): Promise<string> {
    try {
        if (!ip) return '未知';
        if (IsPrivateIp(ip)) return '内网地址';
        const response = await fetch(`https://ipinfo.io/${ip}/json`);
        const data = await response.json();
        return `${data?.region || ''} ${data?.city || ''}`;
    } catch (error) {
        logger.error('查询 IP 地址地区信息失败:' + error);
        return '未知';
    }
};

/**
 * 获取客户端类型
 * @param userAgent 用户代理
 * @returns 客户端类型
 */
export function GetClientType(userAgent: string): IClientType {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    // 小程序检测（优先级最高）
    if (ua.includes('miniprogram') ||
        (ua.includes('micromessenger') && ua.includes('miniprogram')) ||
        ua.includes('swan') || // 百度小程序
        ua.includes('toutiaomicroapp') || // 字节小程序
        (ua.includes('alipay') && ua.includes('miniprogram'))) {
        return 'miniapp';
    };
    // 桌面应用检测
    if (ua.includes('electron') || ua.includes('nwjs') || ua.includes('tauri')) {
        return 'desktop';
    };
    // 移动应用检测（需要排除浏览器）
    if ((ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) &&
        !ua.includes('safari') &&
        !ua.includes('chrome') &&
        !ua.includes('firefox') &&
        !ua.includes('edge') &&
        !ua.includes('micromessenger')) {
        return 'app';
    };
    // Web 浏览器检测
    if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') ||
        ua.includes('firefox') || ua.includes('edge') || ua.includes('opera')) {
        return 'web';
    };
    return 'unknown';
};

/**
 * 获取应用生态平台
 * @param userAgent 用户代理
 * @returns 应用生态平台
 */
export function GetClientPlatform(userAgent: string): IClientPlatform {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();

    // 社交/内容平台检测（优先级最高）
    // 微信平台检测（包括微信浏览器和小程序）
    if (ua.includes('micromessenger')) return 'wechat';
    // 抖音/字节平台检测
    if (ua.includes('aweme') || ua.includes('douyin') || ua.includes('toutiao')) return 'douyin';
    // 微博平台检测
    if (ua.includes('weibo') || ua.includes('__weibo__')) return 'weibo';
    // 小红书平台检测
    if (ua.includes('xiaohongshu') || ua.includes('xhsdiscover')) return 'xiaohongshu';

    // 电商平台检测
    // 支付宝平台检测
    if (ua.includes('alipay') || ua.includes('aliapp')) return 'alipay';
    // 淘宝平台检测
    if (ua.includes('taobao') || ua.includes('aliapp(tb')) return 'taobao';
    // 京东平台检测
    if (ua.includes('jdapp') || ua.includes('jdpingou')) return 'jd';
    // 拼多多平台检测
    if (ua.includes('pinduoduo') || ua.includes('pddapp')) return 'pinduoduo';
    // 搜索/信息平台检测
    // 百度平台检测
    if (ua.includes('baiduboxapp') || ua.includes('baidubrowser')) return 'baidu';

    // 国产浏览器检测（优先于国际浏览器）
    // UC 浏览器
    if (ua.includes('ucbrowser') || ua.includes('ucweb')) return 'uc';
    // QQ 浏览器（注意与 QQ 应用区分）
    if (ua.includes('mqqbrowser') || ua.includes('tencenttraveler')) return 'qq-browser';
    // 夸克浏览器
    if (ua.includes('quark')) return 'quark';
    // 搜狗浏览器
    if (ua.includes('metasr') || ua.includes('sogou')) return 'sogou';
    // 360 浏览器
    if (ua.includes('360') || ua.includes('qihu') || ua.includes('qhbrowser')) return '360-browser';
    // QQ 应用检测（放在 QQ 浏览器之后）
    if (ua.includes('qq/') || ua.includes('qzone')) return 'qq';

    // 国际浏览器检测
    // Edge 浏览器（优先检测，因为包含 chrome 字样）
    if (ua.includes('edg/') || ua.includes('edge/')) return 'edge';
    // Chrome 浏览器
    if (ua.includes('chrome/') && !ua.includes('edg')) return 'chrome';
    // Safari 浏览器（注意很多浏览器都包含 safari 字样）
    if (ua.includes('safari/') && !ua.includes('chrome') && !ua.includes('android')) return 'safari';
    // Firefox 浏览器
    if (ua.includes('firefox/')) return 'firefox';
    // Opera 浏览器
    if (ua.includes('opr/') || ua.includes('opera/')) return 'opera';

    // 原生应用检测（没有浏览器特征的移动端）
    if ((ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) &&
        !ua.includes('safari') &&
        !ua.includes('chrome') &&
        !ua.includes('firefox') &&
        !ua.includes('edge')) {
        return 'native';
    };

    return 'unknown';
};

/**
 * 获取操作系统
 * @param userAgent 用户代理
 * @returns 操作系统
 */
export function GetClientOs(userAgent: string): string {
    if (!userAgent) return '未知';
    const ua = userAgent.toLowerCase();
    // 鸿蒙系统检测（优先检测，因为可能包含 android 字样）
    if (ua.includes('harmonyos') || ua.includes('hongmeng')) {
        const match = ua.match(/harmonyos[\/\s]?(\d+(?:\.\d+)?)/);
        if (match) return `HarmonyOS ${match[1]}`;
        return 'HarmonyOS';
    };
    // Windows 系统检测
    if (ua.includes('windows nt 10.0')) return 'Windows 10/11';
    if (ua.includes('windows nt 6.3')) return 'Windows 8.1';
    if (ua.includes('windows nt 6.2')) return 'Windows 8';
    if (ua.includes('windows nt 6.1')) return 'Windows 7';
    if (ua.includes('windows nt 6.0')) return 'Windows Vista';
    if (ua.includes('windows nt 5.2')) return 'Windows Server 2003';
    if (ua.includes('windows nt 5.1')) return 'Windows XP';
    if (ua.includes('windows nt 5.0')) return 'Windows 2000';
    if (ua.includes('windows')) return 'Windows';
    // macOS 系统检测（带版本名称）
    if (ua.includes('mac os x') || ua.includes('macintosh')) {
        const match = ua.match(/mac os x (\d+)[._](\d+)(?:[._](\d+))?/);
        if (match) {
            const major = match[1];
            const minor = match[2];
            const versionNames: Record<string, string> = {
                '10.15': 'Catalina',
                '10.14': 'Mojave',
                '10.13': 'High Sierra',
                '10.12': 'Sierra',
                '11': 'Big Sur',
                '12': 'Monterey',
                '13': 'Ventura',
                '14': 'Sonoma',
                '15': 'Sequoia'
            };
            const versionKey = major === '10' ? `${major}.${minor}` : major;
            const versionName = versionNames[versionKey];
            return versionName ? `macOS ${versionName}` : `macOS ${major}.${minor}`;
        };
        return 'macOS';
    };
    // iOS 系统检测
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        const match = ua.match(/os (\d+)[._](\d+)(?:[._](\d+))?/);
        if (match) return `iOS ${match[1]}.${match[2]}`;
        return 'iOS';
    };
    // Android 系统检测
    if (ua.includes('android')) {
        const match = ua.match(/android (\d+(?:\.\d+)?(?:\.\d+)?)/);
        if (match) return `Android ${match[1]}`;
        return 'Android';
    };
    // Chrome OS 检测
    if (ua.includes('cros') || ua.includes('chromeos')) {
        const match = ua.match(/cros[\/\s][\w]+\s(\d+(?:\.\d+)?)/);
        if (match) return `Chrome OS ${match[1]}`;
        return 'Chrome OS';
    };
    // 国产 Linux 发行版检测
    if (ua.includes('uos') || ua.includes('uniontech')) return '统信 UOS';
    if (ua.includes('kylin')) return '银河麒麟';
    if (ua.includes('deepin')) return '深度 Deepin';
    if (ua.includes('newstart')) return '中兴新支点';
    if (ua.includes('redflag')) return '红旗 Linux';
    // 其他 Linux 发行版检测
    if (ua.includes('ubuntu')) return 'Ubuntu';
    if (ua.includes('debian')) return 'Debian';
    if (ua.includes('fedora')) return 'Fedora';
    if (ua.includes('centos')) return 'CentOS';
    if (ua.includes('arch')) return 'Arch Linux';
    if (ua.includes('manjaro')) return 'Manjaro';
    if (ua.includes('mint')) return 'Linux Mint';
    if (ua.includes('linux')) return 'Linux';
    // 其他系统
    if (ua.includes('unix')) return 'Unix';
    if (ua.includes('bsd')) return 'BSD';
    return '未知';
};

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
        logger.error('获取客户端信息失败:' + error);
        return null;
    }
};