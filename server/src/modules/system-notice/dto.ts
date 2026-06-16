import { t } from 'elysia';
import { InsertSystemNotice, SelectSystemNotice } from "@database/schema/system_notice";
import { CrudDto } from '@/types/dto';

export const CreateDto = CrudDto.create(
    InsertSystemNotice,
    SelectSystemNotice,
    ['title', 'noticeType', 'content']
);

export const UpdateDto = CrudDto.update(SelectSystemNotice, 'noticeId');

export const ListDto = CrudDto.list(
    SelectSystemNotice,
    {
        title: t.Optional(t.String({ description: "公告标题" })),
        noticeType: t.Optional(t.String({ description: "通知类型" })),
        status: t.Optional(t.Boolean({ description: "发布状态" })),
    }
);