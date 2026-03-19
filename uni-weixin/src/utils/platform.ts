/**
 * 平台检测工具
 */
export const platform = {
    /**
     * 获取当前平台名称
     */
    get name() {
        // #ifdef MP-WEIXIN
        return 'WechatMiniProgram'
        // #endif

        // #ifdef H5
        return 'H5'
        // #endif

        // #ifdef APP-PLUS
        return 'App'
        // #endif

        // #ifdef MP-ALIPAY
        return 'AlipayMiniProgram'
        // #endif

        // #ifdef MP-BAIDU
        return 'BaiduMiniProgram'
        // #endif

        return 'Unknown'
    },

    /**
     * 是否是微信小程序
     */
    get isWechatMiniProgram() {
        return this.name === 'WechatMiniProgram'
    },

    /**
     * 是否是 H5
     */
    get isH5() {
        return this.name === 'H5'
    },

    /**
     * 是否是 App
     */
    get isApp() {
        return this.name === 'App'
    },
}
