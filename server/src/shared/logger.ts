/**
 * 统一日志工具
 * 提供格式化的日志输出，支持不同级别
 */

enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

class Logger {
    private formatMessage(level: LogLevel, message: string, meta?: Record<string, any>): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    }

    info(message: string, meta?: Record<string, any>): void {
        console.log(this.formatMessage(LogLevel.INFO, message, meta));
    }

    success(message: string): void {
        console.log(`✓ ${message}`);
    }

    warn(message: string, meta?: Record<string, any>): void {
        console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }

    error(message: string, meta?: Record<string, any>): void {
        console.error(this.formatMessage(LogLevel.ERROR, message, meta));
    }

    debug(message: string, meta?: Record<string, any>): void {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
        }
    }

    /**
     * 打印分组标题
     */
    group(title: string): void {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`  ${title}`);
        console.log('─'.repeat(60));
    }

    /**
     * 打印应用启动信息
     */
    logStartup(config: {
        appId: string;
        port: number;
        prefix: string;
        env: string;
        pid: number;
        openApiEnabled?: boolean;
    }): void {
        const { appId, port, prefix, env, pid, openApiEnabled } = config;
        const baseUrl = `http://localhost:${port}${prefix}`;

        console.log('\n' + '='.repeat(60));
        console.log(`🚀 ${appId} 启动成功`);
        console.log('='.repeat(60));
        console.log(`服务地址:     ${baseUrl}`);

        if (openApiEnabled) {
            console.log(`API文档:      ${baseUrl}/openapi`);
            console.log(`OpenAPI JSON: ${baseUrl}/openapi/json`);
        }

        console.log(`启动时间:     ${new Date().toLocaleString('zh-CN')}`);
        console.log(`运行环境:     ${env}`);
        console.log(`进程ID:       ${pid}`);
        console.log('='.repeat(60) + '\n');
    }
}

export const logger = new Logger();
