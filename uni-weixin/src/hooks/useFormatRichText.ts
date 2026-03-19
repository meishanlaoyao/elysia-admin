/**
 * 格式化富文本内容
 * @param html 富文本内容
 * @returns 格式化后的富文本内容
 */
export function FormatRichText(html: string | undefined | null) {
    if (!html) return ''
    // 段落
    html = html.replace(/<p(\s[^>]*)?>/gi, '<p style="margin: 10px 0; line-height: 1.8; color: #333;">')
    // 标题
    html = html.replace(/<h1(\s[^>]*)?>/gi, '<h1 style="margin: 15px 0 10px; font-weight: bold; font-size: 24px; line-height: 1.5; color: #070C1B;">')
    html = html.replace(/<h2(\s[^>]*)?>/gi, '<h2 style="margin: 15px 0 10px; font-weight: bold; font-size: 20px; line-height: 1.5; color: #070C1B;">')
    html = html.replace(/<h3(\s[^>]*)?>/gi, '<h3 style="margin: 15px 0 10px; font-weight: bold; font-size: 18px; line-height: 1.5; color: #070C1B;">')
    html = html.replace(/<h4(\s[^>]*)?>/gi, '<h4 style="margin: 15px 0 10px; font-weight: bold; font-size: 16px; line-height: 1.5; color: #292929;">')
    html = html.replace(/<h5(\s[^>]*)?>/gi, '<h5 style="margin: 15px 0 10px; font-weight: bold; font-size: 14px; line-height: 1.5; color: #292929;">')
    html = html.replace(/<h6(\s[^>]*)?>/gi, '<h6 style="margin: 15px 0 10px; font-weight: bold; font-size: 13px; line-height: 1.5; color: #292929;">')
    // 图片
    html = html.replace(/<img(\s[^>]*)?>/gi, (match) => {
        return match.replace(/<img/, '<img style="max-width: 100%; height: auto; display: block; margin: 10px 0; border-radius: 8px;"')
    })
    // 视频
    html = html.replace(/<video(\s[^>]*)?>/gi, (match) => {
        return match.replace(/<video/, '<video style="width: 100%; height: auto; display: block; margin: 10px 0; border-radius: 8px;"')
    })
    // 列表
    html = html.replace(/<ul(\s[^>]*)?>/gi, '<ul style="margin: 10px 0; padding-left: 20px;">')
    html = html.replace(/<ol(\s[^>]*)?>/gi, '<ol style="margin: 10px 0; padding-left: 20px;">')
    html = html.replace(/<li(\s[^>]*)?>/gi, '<li style="margin: 5px 0; line-height: 1.8; color: #333;">')
    // 引用
    html = html.replace(/<blockquote(\s[^>]*)?>/gi, '<blockquote style="margin: 10px 0; padding: 10px 15px; background-color: #f5f5f5; border-left: 4px solid #8FF5BC; color: #666;">')
    // 代码
    html = html.replace(/<code(\s[^>]*)?>/gi, '<code style="padding: 2px 6px; background-color: #f5f5f5; border-radius: 4px; font-family: Consolas, Monaco, monospace; font-size: 12px; color: #e83e8c;">')
    html = html.replace(/<pre(\s[^>]*)?>/gi, '<pre style="margin: 10px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px; overflow-x: auto;">')
    // 链接
    html = html.replace(/<a(\s[^>]*)?>/gi, (match) => {
        return match.replace(/<a/, '<a style="color: #4d80f0; text-decoration: underline;"')
    })
    // 加粗和斜体
    html = html.replace(/<strong(\s[^>]*)?>/gi, '<strong style="font-weight: bold; color: #070C1B;">')
    html = html.replace(/<b(\s[^>]*)?>/gi, '<b style="font-weight: bold; color: #070C1B;">')
    html = html.replace(/<em(\s[^>]*)?>/gi, '<em style="font-style: italic;">')
    html = html.replace(/<i(\s[^>]*)?>/gi, '<i style="font-style: italic;">')
    // 表格
    html = html.replace(/<table(\s[^>]*)?>/gi, '<table style="width: 100%; margin: 10px 0; border-collapse: collapse; border-radius: 8px; overflow: hidden;">')
    html = html.replace(/<th(\s[^>]*)?>/gi, '<th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left; background-color: #f5f5f5; font-weight: bold; color: #070C1B;">')
    html = html.replace(/<td(\s[^>]*)?>/gi, '<td style="padding: 10px; border: 1px solid #e5e7eb; text-align: left; color: #333;">')
    return html
}