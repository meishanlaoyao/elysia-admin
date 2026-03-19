import config from "@/config";
import { Get, Set } from "@/core/database/redis";
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
    const { access_token, expires_in } = data;
    if (!access_token) throw new Error('获取接口调用凭证据失败');
    await Set(CacheEnum.WXMP_ACCESS_TOKEN, access_token, expires_in);
    return access_token;
};

/**
 * 用户信息-获取手机号
 * @param code wx.getPhoneNumber() 返回的 code
 * @returns
 */
export async function GetPhoneNumber(code: string) {
    let access_token = await Get(CacheEnum.WXMP_ACCESS_TOKEN);
    if (!access_token) access_token = await GetAccessToken()
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`;
    const res = await fetch(url, { method: 'POST', body: JSON.stringify({ code }) });
    const data = await res.json();
    if (data.errcode === 0 && data.errmsg === 'ok') return data.phone_info;
    throw new Error(data.errmsg || '获取手机号失败');
};

/**
 * 小程序登录-小程序登录凭证校验
 * @param code wx.login() 返回的 code
 * @returns
 * */
export async function WxmpLogin(code: string): Promise<{ session_key: string, openid: string }> {
    const { appId, appSecret } = wxmp;
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.session_key && data.openid) return data;
    throw new Error(data.errmsg || '小程序登录失败');
};