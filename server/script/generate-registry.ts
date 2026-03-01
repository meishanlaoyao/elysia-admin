import { readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '@/shared/logger';

/**
 * 生成模块注册文件的配置
 */
interface GenerateRegistryOptions {
    /** 模块目录路径 */
    modulesPath: string;
    /** 要扫描的文件名（如 'route' 或 'task'） */
    fileName: string;
    /** 输出文件路径 */
    outputPath: string;
    /** 导出变量名 */
    exportName: string;
}

/**
 * 生成模块注册文件
 * 用于在构建时预生成路由和任务的导入列表
 */
export function generateRegistry(options: GenerateRegistryOptions): number {
    const { modulesPath, fileName, outputPath, exportName } = options;
    const modules = readdirSync(modulesPath);
    const imports: string[] = [];
    const exports: string[] = [];
    modules.forEach((moduleName, index) => {
        const moduleFile = join(modulesPath, moduleName, `${fileName}.ts`);
        if (existsSync(moduleFile)) {
            imports.push(`import ${fileName}${index} from '@/modules/${moduleName}/${fileName}';`);
            exports.push(`${fileName}${index}`);
        }
    });
    const content = `// 自动生成的${fileName}注册文件
// 此文件由构建脚本生成，请勿手动修改
${imports.join('\n')}

export const ${exportName} = [
    ${exports.join(',\n    ')}
];
`;
    writeFileSync(outputPath, content, 'utf-8');
    logger.info(`✓ 生成${fileName}注册文件，共 ${exports.length} 个模块`);
    return exports.length;
};