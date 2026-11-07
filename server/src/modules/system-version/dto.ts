import { t } from 'elysia';
import { BaseResultDto } from '@/types/dto';

/** 版本条目（当前版本与历史版本共用） */
export const VersionItemDto = t.Object({
    version: t.String({ description: '版本号' }),
    releaseTime: t.String({ description: '发布日期时间' }),
    title: t.String({ description: '版本标题' }),
    forceUpdate: t.Boolean({ description: '是否建议强制更新' }),
    content: t.String({ description: '更新内容（简单富文本）' }),
});

/** 版本信息响应（含当前版本与历史版本列表） */
export const VersionDto = BaseResultDto(
    t.Object({
        current: VersionItemDto,
        history: t.Array(VersionItemDto),
    })
);