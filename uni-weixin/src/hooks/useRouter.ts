/**
 * 返回上一页
 */
export function GoBack() {
    uni.navigateBack()
}

/**
 * 跳转普通页面
 */
export function GoToPage(url: string) {
    uni.navigateTo({ url })
}