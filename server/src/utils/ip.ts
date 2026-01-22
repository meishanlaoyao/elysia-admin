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