import config from "@/config";

const { app } = config;

/**
 * 生成忘记密码重置邮件 HTML 模板
 * @param resetUrl 重置密码链接
 * @param token 重置密码 token
 * @param name 用户名
 * @returns 
 */
export function GenerateForgetPasswordHtmlTemplate(resetUrl: string, name: string = '用户') {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>重置密码 - ${app.id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
        }
        body {
            background: linear-gradient(135deg, #f0f7ff 0%, #f8fafc 50%, #f0f9ff 100%);
            padding: 20px;
            color: #0f172a;
            line-height: 1.6;
        }
        .email-container {
            max-width: 700px;
            width: 100%;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 20px 40px -10px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
            border: 1px solid rgba(59, 130, 246, 0.1);
        }
        /* 添加一个装饰性背景 */
        .header-pattern {
            background-color: #3b82f6;
            background-image: 
                linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1)),
                linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1));
            background-size: 40px 40px;
            background-position: 0 0, 20px 20px;
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header-pattern::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%);
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: -0.01em;
        }
        .elysia-logo {
            font-weight: 800;
            color: #ffffff;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        .email-header p {
            opacity: 0.95;
            font-size: 16px;
            font-weight: 400;
        }
        .email-body {
            padding: 48px 40px 40px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 28px;
            color: #0f172a;
            font-weight: 500;
        }
        .description {
            margin-bottom: 32px;
            color: #334155;
        }
        .reset-button-container {
            text-align: center;
            margin: 40px 0 36px;
        }
        .reset-button {
            display: inline-block;
            padding: 18px 40px;
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 17px;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
            border: none;
            letter-spacing: 0.3px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }
        .button-icon {
            margin-right: 10px;
            font-size: 18px;
            vertical-align: middle;
        }
        .link-alternative {
            text-align: center;
            margin: 36px 0 40px;
            color: #64748b;
            font-size: 14px;
        }
        .link-alternative p {
            margin-bottom: 12px;
        }
        .link-text {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 16px 20px;
            border-radius: 8px;
            word-break: break-all;
            font-family: Monaco, Consolas, monospace;
            font-size: 13px;
            color: #334155;
            border: 1px solid #e2e8f0;
            line-height: 1.5;
        }
        .instructions {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-left: 4px solid #3b82f6;
            padding: 24px 28px;
            margin: 32px 0;
            border-radius: 0 8px 8px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .instructions-title {
            color: #0f172a;
            margin-bottom: 16px;
            font-weight: 600;
            font-size: 18px;
            display: flex;
            align-items: center;
        }
        .instructions-title span {
            margin-right: 10px;
            font-size: 20px;
        }
        .instructions-list {
            padding-left: 22px;
            color: #334155;
        }
        .instructions-list li {
            margin-bottom: 10px;
            padding-left: 4px;
        }
        /* 修复提示框布局 */
        .alert-box {
            border-radius: 8px;
            padding: 22px 26px;
            margin: 32px 0;
            display: flex;
            align-items: flex-start;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .alert-icon {
            font-size: 24px;
            margin-right: 16px;
            flex-shrink: 0;
            line-height: 1;
            margin-top: 2px;
        }
        .alert-content {
            flex: 1;
        }
        .alert-title {
            font-weight: 600;
            margin-bottom: 6px;
            color: #0f172a;
            font-size: 16px;
        }
        .alert-message {
            color: #334155;
            line-height: 1.5;
        }
        .expiration-alert {
            background: linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.04) 100%);
            border-left: 4px solid #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .security-alert {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
            border-left: 4px solid #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .email-footer {
            padding: 32px 40px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .email-footer p {
            margin-bottom: 8px;
            line-height: 1.5;
        }
        .brand-signature {
            font-weight: 600;
            color: #3b82f6;
            margin-top: 16px;
            font-size: 15px;
            letter-spacing: 0.5px;
        }
        /* 添加一个装饰性元素 */
        .decoration-line {
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
            margin: 30px auto;
            width: 100px;
            border-radius: 3px;
        }
        @media (max-width: 768px) {
            .email-body {
                padding: 32px 24px 24px;
            }
            .header-pattern {
                padding: 32px 24px;
            }
            .email-header h1 {
                font-size: 24px;
            }
            .reset-button {
                padding: 16px 32px;
                width: 100%;
                max-width: 300px;
            }
            .email-footer {
                padding: 24px;
            }
            .instructions {
                padding: 20px 24px;
            }
            .alert-box {
                padding: 18px 22px;
                flex-direction: row;
            }
        }
        @media (max-width: 480px) {
            body {
                padding: 12px;
            }
            .email-body {
                padding: 28px 20px 20px;
            }
            .reset-button {
                padding: 16px 24px;
                font-size: 16px;
            }
            .link-text {
                padding: 12px 16px;
                font-size: 12px;
            }
            .alert-box {
                flex-direction: row;
            }
            .alert-icon {
                margin-right: 12px;
                font-size: 20px;
            }
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        .email-table {
            width: 100%;
            max-width: 700px;
        }
    </style>
</head>
<body>
    <table class="email-table" align="center" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td>
                <div class="email-container">
                    <div class="header-pattern">
                        <div class="header-content">
                            <h1><span class="elysia-logo">${app.id}</span> 密码重置</h1>
                            <p>安全重置您的账户密码</p>
                        </div>
                    </div>
                    <div class="email-body">
                        <p class="greeting">尊敬的 ${name}，您好！</p>
                        <p class="description">
                            我们收到了您重置 <strong>${app.id}</strong> 账户密码的请求。请点击下方按钮来重置您的账户密码：
                        </p>
                        <div class="reset-button-container">
                            <a href="${resetUrl}"
                                class="reset-button">
                                <span class="button-icon">🔑</span> 重置密码
                            </a>
                        </div>
                        <div class="link-alternative">
                            <p>如果上面的按钮无法点击，您可以复制以下链接到浏览器地址栏中打开：</p>
                            <div class="link-text">${resetUrl}</div>
                        </div>
                        <div class="decoration-line"></div>
                        <div class="instructions">
                            <div class="instructions-title">
                                <span>📋</span> 重置密码指引
                            </div>
                            <ol class="instructions-list">
                                <li>点击上方"重置密码"按钮（或复制链接到浏览器）</li>
                                <li>在打开的 <strong>${app.id}</strong> 安全页面中设置新密码</li>
                                <li>使用新密码登录您的账户</li>
                            </ol>
                        </div>
                        <div class="alert-box expiration-alert">
                            <div class="alert-icon">⏰</div>
                            <div class="alert-content">
                                <div class="alert-title">请注意：</div>
                                <div class="alert-message">
                                    此链接仅在 <strong>${app.forgetPasswordExpiresIn / 60}</strong> 分钟内有效。如果您没有请求重置密码，请忽略此邮件，您的密码将保持不变。
                                </div>
                            </div>
                        </div>
                        <div class="alert-box security-alert">
                            <div class="alert-icon">🛡️</div>
                            <div class="alert-content">
                                <div class="alert-title">安全提示：</div>
                                <div class="alert-message">
                                    为保护您的账户安全，请勿将此链接分享给他人。如果您在重置密码过程中遇到任何问题，请联系我们的技术支持团队。
                                </div>
                            </div>
                        </div>
                        <p style="margin-top: 32px; color: #334155; text-align: center;">
                            感谢您使用 <strong>${app.id}</strong> 管理系统！
                        </p>
                    </div>
                    <div class="email-footer">
                        <p>© 2025 ${app.id} 版权所有</p>
                        <p>此邮件由系统自动发送，请勿直接回复。</p>
                        <p class="brand-signature">Powered by <strong>${app.id}</strong></p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
};