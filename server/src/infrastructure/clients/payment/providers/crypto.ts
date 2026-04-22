import crypto from 'node:crypto';

/**
 * RSA-SHA256 签名（支付宝用）
 * privateKey: PKCS8 PEM 格式
 */
export function rsaSign(content: string, privateKey: string): string {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(content, 'utf8');
    return sign.sign(privateKey, 'base64');
}

/**
 * RSA-SHA256 验签（支付宝回调用）
 * publicKey: PKCS8 PEM 格式
 */
export function rsaVerify(content: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(content, 'utf8');
    return verify.verify(publicKey, signature, 'base64');
}

/**
 * RSA-OAEP 解密（微信 v3 敏感字段解密）
 */
export function rsaDecrypt(ciphertext: string, privateKey: string): string {
    const buf = Buffer.from(ciphertext, 'base64');
    return crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha1' },
        buf,
    ).toString('utf8');
}

/**
 * AES-256-GCM 解密（微信 v3 回调 resource 解密）
 */
export function aesGcmDecrypt(ciphertext: string, key: string, nonce: string, aad: string): string {
    const keyBuf = Buffer.from(key, 'utf8'); // api_v3_key 32字节
    const nonceBuf = Buffer.from(nonce, 'utf8');
    const data = Buffer.from(ciphertext, 'base64');
    // 最后 16 字节是 authTag
    const authTag = data.subarray(data.length - 16);
    const encrypted = data.subarray(0, data.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuf, nonceBuf);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(aad, 'utf8'));
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

/**
 * HMAC-SHA256（微信 v3 签名用）
 */
export function hmacSha256(content: string, key: string): string {
    return crypto.createHmac('sha256', key).update(content).digest('hex');
}

/**
 * SHA256withRSA 签名（微信 v3 请求签名）
 */
export function sha256WithRsa(content: string, privateKey: string): string {
    const sign = crypto.createSign('SHA256withRSA');
    sign.update(content);
    return sign.sign(privateKey, 'base64');
}

/**
 * 对象按 key 字典序排列后拼接成 query string（支付宝签名用）
 */
export function buildSortedQueryString(params: Record<string, string>): string {
    return Object.keys(params)
        .filter(k => params[k] !== '' && params[k] !== undefined)
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join('&');
}
