/**
 * 生成请求/响应加解密所需的 RSA 密钥对，并写入对应环境的 yaml 配置
 *
 * 用法（在 server/ 下执行）:
 *   bun run gen:crypto-keys                  # 写入 development.yaml
 *   bun run gen:crypto-keys production       # 写入 production.yaml
 *   bun run gen:crypto-keys production --force   # 已有密钥时强制覆盖
 *
 * 只替换 crypto 段的 privateKey / publicKey，crypto 段其余内容（mode / routes / 注释）原样保留。
 */
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const force = args.includes('--force');
const env = args.find((a) => !a.startsWith('--')) ?? 'development';
if (!['development', 'production'].includes(env)) {
    console.error(`未知环境: ${env}，可选 development / production`);
    process.exit(1);
};
const file = resolve(import.meta.dirname, `../src/config/${env}.yaml`);
const text = readFileSync(file, 'utf-8');
const eol = text.includes('\r\n') ? '\r\n' : '\n';
const blockRe = /^crypto:[^\S\r\n]*\r?\n(?:(?:[ \t]+.*|)(?:\r?\n|$))*/m;
const block = text.match(blockRe)?.[0];
if (!block) {
    console.error(`${file} 中没有找到 crypto 段，请先补充 "crypto:" 配置`);
    process.exit(1);
};
if (/^\s+privateKey:\s*(\||[^\s"'|].*|".+"|'.+')/m.test(block) && !force) {
    console.error(`${env}.yaml 已存在密钥，覆盖后旧密钥加密的数据将无法解密。确认覆盖请加 --force`);
    process.exit(1);
};
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const indent = (pem: string) => pem.trim().split('\n').map((l) => `    ${l}`).join(eol);
const replacements: Record<string, string> = {
    privateKey: `  privateKey: |${eol}${indent(privateKey)}`,
    publicKey: `  publicKey: |${eol}${indent(publicKey)}`,
};
// 逐行处理：只替换 privateKey / publicKey 条目（块标量 | 或 > 时连同缩进的后续行），其余内容原样保留
const lines = block.split(/\r?\n/);
const out: string[] = [];
const done = new Set<string>();
for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^  (privateKey|publicKey):\s*(.*)$/);
    if (!m) { out.push(lines[i]); continue; }
    out.push(replacements[m[1]]);
    done.add(m[1]);
    if (/^[|>][+-]?\s*$/.test(m[2])) {
        while (i + 1 < lines.length && /^[ \t]{3,}\S/.test(lines[i + 1])) i++;
    }
}
for (const k of Object.keys(replacements)) {
    if (done.has(k)) continue;
    let end = out.length;
    while (end > 1 && out[end - 1].trim() === '') end--;
    out.splice(end, 0, replacements[k]);
}
const next = out.join(eol);
const mode = block.match(/^\s+mode:\s*["']?(\w+)/m)?.[1] ?? 'off';
writeFileSync(file, text.replace(blockRe, () => next));
console.log(`✓ 已生成 RSA-2048 密钥对并写入 ${file}`);
console.log(`  mode 当前为 ${mode}${mode === 'off' ? '，如需启用请改为 include / exclude' : ''}`);
console.log('  注意: 私钥不要提交到仓库');