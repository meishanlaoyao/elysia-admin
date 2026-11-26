/**
 * 请求/响应加解密工具（RSA-OAEP + AES-GCM，基于浏览器 Web Crypto，无额外依赖）
 *
 * 协议：每次请求生成随机 AES-256 密钥，用后端 RSA 公钥加密后放入 X-Encrypt-Key 请求头；
 * 请求体/响应体使用 AES-GCM 加密，格式为 Base64(iv(12) + 密文)。
 *
 * @module utils/crypto
 */
import axios from 'axios'

const IV_LENGTH = 12
const { VITE_API_URL } = import.meta.env

let encryptConfigPromise: Promise<EncryptConfig | null> | null = null

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}

function fromBase64(text: string): Uint8Array {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0))
}

interface EncryptConfig {
  publicKey: CryptoKey
  mode: 'include' | 'exclude'
  routes: { methods: Set<string>; pattern: RegExp }[]
}

/** 从后端获取加密模式、接口列表与公钥；失败或 mode=off 返回 null（自动退回明文） */
async function fetchEncryptConfig(): Promise<EncryptConfig | null> {
  try {
    const res = await axios.get(`${VITE_API_URL}/api/crypto/public-key`)
    const { mode, routes, publicKey } = res.data?.data ?? {}
    if ((mode !== 'include' && mode !== 'exclude') || !publicKey) return null
    const body = String(publicKey).replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')
    return {
      mode,
      routes: ((routes ?? []) as { method: string[]; url: string }[]).map(({ method, url }) => ({
        methods: new Set(method.map((m) => m.toUpperCase())),
        pattern: new RegExp(`^${url.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`)
      })),
      publicKey: await crypto.subtle.importKey(
        'spki',
        fromBase64(body) as BufferSource,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      )
    };
  } catch {
    return null
  }
}

/**
 * 获取本次请求用于加密的公钥：后端未开启加密或该接口不要求加密时返回 null；配置只拉取一次
 * @param method 请求方法
 * @param url 请求地址（可含域名与 query）
 */
export async function getEncryptPublicKey(method = 'GET', url = ''): Promise<CryptoKey | null> {
  encryptConfigPromise ??= fetchEncryptConfig()
  const cfg = await encryptConfigPromise
  if (!cfg) return null
  const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0]
  const upper = method.toUpperCase()
  if (upper === 'OPTIONS' || path === '/api/crypto/public-key') return null
  const hit = cfg.routes.some((r) => (r.methods.has('*') || r.methods.has(upper)) && r.pattern.test(path))
  return (cfg.mode === 'include' ? hit : !hit) ? cfg.publicKey : null
}

/** AES-GCM 加密字符串，返回 Base64(iv + 密文) */
export async function aesEncrypt(key: CryptoKey, text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text))
  )
  const out = new Uint8Array(IV_LENGTH + cipher.length)
  out.set(iv, 0)
  out.set(cipher, IV_LENGTH)
  return toBase64(out)
}

/** AES-GCM 解密 Base64(iv + 密文)，返回明文字符串 */
export async function aesDecrypt(key: CryptoKey, payload: string): Promise<string> {
  const buf = fromBase64(payload)
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: buf.slice(0, IV_LENGTH) },
    key,
    buf.slice(IV_LENGTH)
  )
  return new TextDecoder().decode(plain)
}

/**
 * 生成本次请求的 AES 密钥，并用公钥加密
 * @returns aesKey 用于加密请求体与解密响应；wrappedKey 放入 X-Encrypt-Key 请求头
 */
export async function createRequestKey(publicKey: CryptoKey) {
  const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt'
  ])
  const raw = await crypto.subtle.exportKey('raw', aesKey)
  const wrapped = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, raw)
  return { aesKey, wrappedKey: toBase64(new Uint8Array(wrapped)) }
}