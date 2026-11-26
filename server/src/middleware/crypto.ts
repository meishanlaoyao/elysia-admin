import type { Elysia } from 'elysia';
import config from '@/config';
import { BaseResultData } from '@/core/result';
import { RsaDecryptKey, AesGcmDecrypt, AesGcmEncrypt } from '@/shared/crypto-envelope';

const KEY_HEADER = 'x-encrypt-key';
const requestKeys = new WeakMap<Request, CryptoKey>();
const plainResponses = new WeakMap<Request, unknown>();
const parseFailed = new WeakSet<Request>();

/**
 * 构造带 httpStatus 的错误，交由全局 error-handler 输出中文提示
 * @param message 错误提示
 * @returns Error
 */
function CryptoError(message: string) {
    const e = new Error(message) as Error & { httpStatus?: number };
    e.httpStatus = 400;
    return e;
};

/** 公钥接口与预检请求永不要求加密 */
const PUBLIC_KEY_PATH = '/api/crypto/public-key';

/** 解析后的路由规则 */
interface ParsedRoute { methods: Set<string>; pattern: RegExp }

/**
 * 把配置中的 routes 解析为方法集合 + 路径正则（url 中 * 匹配任意字符）
 * @param routes 配置的接口列表
 * @returns 解析后的规则列表
 */
function ParseRoutes(routes: typeof config.crypto.routes): ParsedRoute[] {
    return routes.map(({ method, url }) => {
        const source = url.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        return {
            methods: new Set((Array.isArray(method) ? method : [method]).map((m) => m.toUpperCase())),
            pattern: new RegExp(`^${source}$`),
        };
    });
};

const parsedRoutes = ParseRoutes(config.crypto.routes);

/**
 * 判断请求是否要求加密：include 模式命中列表才加密；exclude 模式未命中才加密
 * @param method HTTP 方法
 * @param path 请求路径（不含 query）
 * @returns 是否要求加密
 */
function ShouldEncrypt(method: string, path: string): boolean {
    const { mode } = config.crypto;
    if (mode === 'off' || method === 'OPTIONS' || path === PUBLIC_KEY_PATH) return false;
    const upper = method.toUpperCase();
    const hit = parsedRoutes.some((r) => (r.methods.has('*') || r.methods.has(upper)) && r.pattern.test(path));
    return mode === 'include' ? hit : !hit;
};

/**
 * 请求/响应加解密中间件（RSA + AES-GCM）
 *
 * 1. onRequest：请求头带 X-Encrypt-Key 时，用 RSA 私钥解出本次 AES 密钥并按 Request 缓存
 * 2. onParse：JSON 请求体为 { data: 密文 } 时解密成对象，下游校验与 handle 无感知
 * 3. mapResponse：本次请求有 AES 密钥且响应为 JSON 对象时，加密成 { encrypted: true, data }
 *
 * 无 X-Encrypt-Key 的明文请求：按 mode/routes 判断需加密则返回 400，否则放行；mode=off 时不注册。
 * @param app Elysia 实例
 */
export function CryptoMiddleware(app: Elysia) {
    if (config.crypto.mode === 'off') return;
    app.onRequest(async ({ request }) => {
        const wrapped = request.headers.get(KEY_HEADER);
        if (!wrapped) {
            if (ShouldEncrypt(request.method, new URL(request.url).pathname)) throw CryptoError('该接口需加密传输');
            return;
        };
        try {
            requestKeys.set(request, await RsaDecryptKey(wrapped));
        } catch {
            throw CryptoError('请求解密失败');
        }
    });
    app.onParse(async ({ request, contentType }) => {
        const key = requestKeys.get(request);
        if (!key || !contentType?.includes('application/json')) return;
        const text = await request.text();
        if (!text) return;
        try {
            const { data } = JSON.parse(text);
            return JSON.parse(await AesGcmDecrypt(key, data));
        } catch {
            parseFailed.add(request);
            throw CryptoError('请求解密失败');
        }
    });
    // Elysia 会把 onParse 抛出的异常包装成 PARSE 错误，这里还原为中文 400
    app.onError(({ code, request, set }) => {
        if (code !== 'PARSE' || !parseFailed.has(request)) return;
        set.status = 400;
        return BaseResultData.fail(400, '请求解密失败');
    });
    app.mapResponse(async ({ request, response, set }) => {
        const key = requestKeys.get(request);
        if (!key || response === null || typeof response !== 'object') return;
        if (response instanceof Response || response instanceof Blob || response instanceof ReadableStream) return;
        plainResponses.set(request, response);
        const body = JSON.stringify({ encrypted: true, data: await AesGcmEncrypt(key, JSON.stringify(response)) });
        const headers = new Headers(set.headers as Record<string, string>);
        headers.set('content-type', 'application/json');
        headers.set('x-encrypted', '1');
        return new Response(body, { status: typeof set.status === 'number' ? set.status : 200, headers });
    });
    // 加密后 afterResponse 拿到的是 Response 对象；还原为加密前的业务对象，
    // 供后续 afterResponse（请求日志、操作日志、限流记录）读取 response.code 等字段
    app.onAfterResponse((ctx) => {
        const plain = plainResponses.get(ctx.request);
        if (plain !== undefined) (ctx as any).response = plain;
    });
};