/**
 * 加密
 * @param str 字符串
 * @returns 
 */
export const BcryptHash = (str: string): string => {
    return Bun.password.hashSync(str, {
        algorithm: 'bcrypt',
        cost: 10
    });
};

/**
 * 比较
 * @param str 字符串
 * @param hash 加密后的字符串
 * @returns 
 */
export const BcryptCompare = (str: string, hash: string): boolean => {
    return Bun.password.verifySync(str, hash);
};