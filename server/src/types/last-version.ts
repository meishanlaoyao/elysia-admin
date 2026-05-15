/**
 * 官方 last-version.json 响应结构
 * @see https://elysia-admin.top/last-version.json
 */
export type LastVersionPayload = {
    version: string;
    publishDate?: string;
    description?: string;
    changelogUrl?: string;
    forceUpdate?: boolean;
};