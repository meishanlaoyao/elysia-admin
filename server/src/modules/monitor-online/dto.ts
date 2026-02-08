import { t } from 'elysia';
import { BaseResultListDto } from '@/types/dto';

const OnlineUser = t.Object({
    userId: t.Number({ description: "用户ID" }),
    username: t.String({ description: "用户名" }),
    email: t.String({ description: "邮箱" }),
    phone: t.String({ description: "手机号" }),
    sex: t.String({ description: "性别" }),
    avatar: t.Union([t.String({ description: "头像" }), t.Null()]),
    loginLocation: t.String({ description: "登录地点" }),
    ipaddr: t.String({ description: "IP地址" }),
    userType: t.String({ description: "用户类型" }),
    loginTime: t.String({ description: "登录时间" }),
});

export const ListDto = {
    query: t.Object({
        pageNum: t.Number({ description: "页码", default: 1 }),
        pageSize: t.Number({ description: "每页数量", default: 10 }),
    }),
    ...BaseResultListDto(OnlineUser)
};