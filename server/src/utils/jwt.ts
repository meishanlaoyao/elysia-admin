import { SignJWT, jwtVerify } from 'jose';
import config from '@/config';
import { GenerateUUID } from '@/utils/uuid';

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

/**
 * 解析 JWT 令牌的payload部分
 * @param token 要解析的 JWT 令牌
 * @returns 令牌payload内容
 */
export async function ParseToken(token: string): Promise<any> {
    try {
        if (!token || typeof token !== 'string') {
            throw new Error('无效的令牌');
        };
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('无效的JWT格式，应包含三个部分');
        };
        const payloadBase64Url = parts[1];
        let base64 = payloadBase64Url
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const padLength = 4 - (base64.length % 4);
        if (padLength < 4) {
            base64 += '='.repeat(padLength);
        };
        const decodedString = atob(base64);
        const jsonPayload = decodeURIComponent(
            decodedString
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        return payload;
    } catch (error) {
        console.error('JWT内容解析失败', error);
        return null;
    }
};