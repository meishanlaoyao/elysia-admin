/**
 * 生成短 UUID
 * 使用 Bun 的 UUID v7 并移除连字符，从 36 字符缩短到 32 字符
 */
export const GenerateUUID = () => {
    return Bun.randomUUIDv7().replace(/-/g, '');
};