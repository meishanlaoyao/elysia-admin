/**
 * 加密
 * @param str 字符串
 * @returns
 */
export const BcryptHash = async (str: string): Promise<string> => {
    return Bun.password.hash(str, {
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
export const BcryptCompare = async (str: string, hash: string): Promise<boolean> => {
    return Bun.password.verify(str, hash);
};