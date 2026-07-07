import { t } from 'elysia';
import { SelectSystemLoginLog } from "@database/schema/system_login_log";
import { CrudDto } from '@/types/dto';

export const ListDto = CrudDto.list(
    SelectSystemLoginLog,
    {
        loginName: t.Optional(t.String({ description: "登录用户" })),
        ipaddr: t.Optional(t.String({ description: "IP地址" })),
        loginType: t.Optional(t.String({ description: "用户类型" })),
        status: t.Optional(t.Boolean({ description: "登录状态" })),
    }
);