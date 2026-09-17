import { readdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '@/shared/logger';

type RouteStage = 'development' | 'production';

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
    /**
     * 路由注册目标环境（仅 fileName === 'route' 时生效）。
     * 缺省按 NODE_ENV 归一化：production → production，其余 → development。
     */
    targetStage?: RouteStage;
};

/**
 * 从 route.ts 源码解析 stages 字面量。
 * @returns null = 未声明（默认双环境）；空数组 = 永不收录
 */
function parseRouteStagesFromSource(source: string): RouteStage[] | null {
    const match = source.match(/\bstages\s*:\s*\[([^\]]*)\]/);
    if (!match) return null;
    const items = [...match[1].matchAll(/['"](development|production)['"]/g)].map(
        (m) => m[1] as RouteStage,
    );
    return items;
};

function resolveTargetStage(explicit?: RouteStage): RouteStage {
    if (explicit) return explicit;
    return process.env.NODE_ENV === 'production' ? 'production' : 'development';
};

/**
 * 判断 route 模块是否应收录进当前目标环境
 */
function shouldIncludeRouteModule(source: string, targetStage: RouteStage): boolean {
    const stages = parseRouteStagesFromSource(source);
    if (stages === null) return true;
    return stages.includes(targetStage);
};

/**
 * 生成模块注册文件
 * 用于在构建时预生成路由和任务的导入列表
 */
export function generateRegistry(options: GenerateRegistryOptions): number {
    const { modulesPath, fileName, outputPath, exportName, targetStage } = options;
    const stage = fileName === 'route' ? resolveTargetStage(targetStage) : undefined;
    const modules = readdirSync(modulesPath);
    const imports: string[] = [];
    const exports: string[] = [];
    let importIndex = 0;
    modules.forEach((moduleName) => {
        const moduleFile = join(modulesPath, moduleName, `${fileName}.ts`);
        if (!existsSync(moduleFile)) return;
        if (fileName === 'route' && stage) {
            const source = readFileSync(moduleFile, 'utf-8');
            if (!shouldIncludeRouteModule(source, stage)) {
                logger.info(`跳过路由模块 ${moduleName}（stages 不含 ${stage}）`);
                return;
            }
        }
        imports.push(`import ${fileName}${importIndex} from '@/modules/${moduleName}/${fileName}';`);
        exports.push(`${fileName}${importIndex}`);
        importIndex += 1;
    });
    const content = `// 自动生成的${fileName}注册文件
// 此文件由构建脚本生成，请勿手动修改
${fileName === 'route'
            ? `import type { IRouteModule } from '@/types/route';\n`
            : `import type { ITask } from '@/types/task';\n`}${imports.join('\n')}

export const ${exportName}: ${fileName === 'route' ? 'IRouteModule[]' : 'ITask[]'} = [
    ${exports.join(',\n    ')}
];
`;
    writeFileSync(outputPath, content, 'utf-8');
    logger.info(`✓ 生成${fileName}注册文件，共 ${exports.length} 个模块`);
    return exports.length;
};