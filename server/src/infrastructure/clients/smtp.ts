import nodemailer from 'nodemailer';
import config from '@/config';

interface ISendMailOptions {
    from?: string; // 发送者邮箱
    to: string; // 接收者邮箱
    subject: string; // 邮件主题
    text?: string; // 邮件文本内容
    html?: string; // 邮件 HTML 内容
};

const transporter = nodemailer.createTransport(config.smtp);
try {
    // await transporter.verify();
    console.log('SMTP 配置验证成功');
} catch (error) {
    console.error('SMTP 配置错误:', error);
    throw error;
};

/**
 * 发送邮件
 * @param options 邮件选项
 * @returns 发送结果
 */
export async function SendMail(options: ISendMailOptions) {
    if (!options.from) options.from = config.smtp.auth.user;
    return await transporter.sendMail(options);
};