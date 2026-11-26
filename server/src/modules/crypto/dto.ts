import { t } from 'elysia';
import { BaseResultDto } from '@/types/dto';

export const PublicKeyDto = {
    ...BaseResultDto(t.Object({
        mode: t.Union([t.Literal('off'), t.Literal('include'), t.Literal('exclude')], { description: '加密模式' }),
        routes: t.Array(t.Object({
            method: t.Array(t.String(), { description: '请求方法，* 表示全部' }),
            url: t.String({ description: '接口路径，* 匹配任意字符' }),
        }), { description: '接口列表' }),
        publicKey: t.String({ description: 'RSA 公钥（PEM）' }),
    })),
};