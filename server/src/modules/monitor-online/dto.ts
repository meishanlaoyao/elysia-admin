import { t } from 'elysia';
import { BaseResultListDto, BaseListQueryDto } from '@/types/dto';

export const ListDto = {
    query: BaseListQueryDto({}),
    ...BaseResultListDto(t.Object({
        userId: t.String({ description: "用户ID" }),
        username: t.Optional(t.Union([t.String({ description: "用户名" }), t.Null()])),
        email: t.Optional(t.Union([t.String({ description: "邮箱" }), t.Null()])),
        phone: t.Optional(t.Union([t.String({ description: "手机号" }), t.Null()])),
        sex: t.Optional(t.Union([t.String({ description: "性别" }), t.Null()])),
        avatar: t.Optional(t.Union([t.String({ description: "头像" }), t.Null()])),
        loginLocation: t.String({ description: "登录地点" }),
        ipaddr: t.String({ description: "IP地址" }),
        userType: t.String({ description: "用户类型" }),
        loginTime: t.String({ description: "登录时间" }),
    }))
};