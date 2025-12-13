import { SignJWT, jwtVerify } from 'jose';
import config from '@/config';
import { GenerateUUID } from '@/common/uuid';

type tokenType = 'accessToken' | 'refreshToken';

/**
 * 生成 JWT 令牌
 * @param tokenType 令牌类型 (accessToken 或 refreshToken)
 * @param payload 令牌负载
 * @returns 生成的 JWT 令牌
 */
export function GenerateToken(tokenType: tokenType, payload: any): Promise<string> {
    const { expiresIn, secret } = config.jwt[tokenType];
    const encoder = new TextEncoder().encode(secret);
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .setJti(GenerateUUID())
        .sign(encoder);
};


/**
 * 验证 JWT 令牌
 * @param tokenType 令牌类型 (accessToken 或 refreshToken)
 * @param token 要验证的 JWT 令牌
 * @returns 令牌负载 (如果验证成功) 或 null (如果验证失败)
 */
export async function VerifyToken(tokenType: tokenType, token: string): Promise<any> {
    try {
        const { secret } = config.jwt[tokenType];
        const encoder = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, encoder);
        return payload;
    } catch (error) {
        console.error('VerifyToken error:', error);
        return null;
    }
};