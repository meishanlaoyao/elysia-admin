import config from "@/config";
import { Get } from "@/core/database/redis";
import { CacheEnum } from "@/constants/enum";

const { wxmp } = config;

/**
 * 接口调用凭证-获取接口调用凭据
 */
export async function GetAccessToken() {
    const { appId, appSecret } = wxmp;
    const url = `https://api.weixin.qq.com/cgi-bin/token?appid=${appId}&secret=${appSecret}&grant_type=client_credential`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

/**
 * 用户信息-获取手机号
 * @param code wx.getPhoneNumber() 返回的 code
 * @returns
 */
export async function GetPhoneNumber(code: string) {
    const access_token = await Get(CacheEnum.WXMP_ACCESS_TOKEN);
    if (!access_token) throw new Error('微信小程序access_token为空');
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`;
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
    const data = await res.json();
    return data;
};