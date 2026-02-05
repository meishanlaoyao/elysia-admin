/**
 * 验证是否为IP地址
 * @param ip IP地址字符串
 * @returns 是否为IP地址
 */
export function IsIpAddress(ip: string): boolean {
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
};

/**
 * 验证是否为手机号
 * @param phone 手机号字符串
 * @returns 是否为手机号
 */
export function IsPhoneNumber(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
};

/**
 * 验证是否为邮箱
 * @param email 邮箱字符串
 * @returns 是否为邮箱
 */
export function IsEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
    return emailRegex.test(email);
};

/**
 * 验证是否为URL
 * @param url URL字符串
 * @returns 是否为URL
 */
export function IsUrl(url: string): boolean {
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?$/;
    return urlRegex.test(url);
};

/**
 * 验证是否为大陆身份证
 * @param idCard 大陆身份证字符串
 * @returns 是否为大陆身份证
 */
export function IsIdCard(idCard: string): boolean {
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    return idCardRegex.test(idCard);
};