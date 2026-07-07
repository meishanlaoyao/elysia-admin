import { t } from 'elysia';
import { InsertSystemOperLog, SelectSystemOperLog } from "@database/schema/system_oper_log";
import { CrudDto } from '@/types/dto';

export const ListDto = CrudDto.list(
    SelectSystemOperLog,
    {
        title: t.Optional(t.String({ description: "模块标题" })),
        action: t.Optional(t.String({ description: "操作名称" })),
        operName: t.Optional(t.String({ description: "操作人员" })),
        operIp: t.Optional(t.String({ description: "操作IP" })),
        requestMethod: t.Optional(t.String({ description: "请求方式" })),
        operatorType: t.Optional(t.String({ description: "用户类型" })),
        status: t.Optional(t.Boolean({ description: "操作状态" })),
    }
);