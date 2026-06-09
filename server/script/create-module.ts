import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseSchemaFile, resolveSchemaPath } from './scaffold/schema-parser';
import { renderBackendModule } from './scaffold/templates';

interface CliOptions {
    slug: string;
    tag: string;
    schemaOverride?: string;
    dryRun: boolean;
};

function printUsage(): void {
    console.log(`
用法: bun run create:module <group-name> [选项]

示例:
  bun run create:module business-goods --tag 商品管理
  bun run create:module system-api --tag 系统API --dry-run

选项:
  --tag <名称>       OpenAPI 分组名（必填）
  --schema <file>    Schema 文件名（不含 .ts，默认按 slug 推断，如 business_goods）
  --dry-run          仅预览，不写入文件
  --help             显示帮助
`);
};

function parseArgs(argv: string[]): CliOptions | null {
    if (argv.includes('--help') || argv.length === 0) {
        printUsage();
        return null;
    };
    const slug = argv.find((arg) => !arg.startsWith('--'));
    if (!slug) {
        console.error('错误: 请提供模块 slug，例如 business-goods');
        printUsage();
        process.exit(1);
    };
    const tagIdx = argv.indexOf('--tag');
    const tag = tagIdx !== -1 ? argv[tagIdx + 1] : '';
    if (!tag) {
        console.error('错误: 请使用 --tag 指定 OpenAPI 分组名');
        process.exit(1);
    };
    const schemaIdx = argv.indexOf('--schema');
    const schemaOverride = schemaIdx !== -1 ? argv[schemaIdx + 1] : undefined;
    const dryRun = argv.includes('--dry-run');
    return { slug, tag, schemaOverride, dryRun };
};

function main(): void {
    const options = parseArgs(process.argv.slice(2));
    if (!options) return;
    const serverRoot = join(import.meta.dir, '..');
    const moduleDir = join(serverRoot, 'src/modules', options.slug);
    if (existsSync(moduleDir)) {
        console.error(`错误: 模块目录已存在: ${moduleDir}`);
        process.exit(1);
    };
    const { schemaFilePath, schemaImportPath } = resolveSchemaPath(
        serverRoot,
        options.slug,
        options.schemaOverride,
    );
    let schema;
    try {
        schema = parseSchemaFile(schemaFilePath, schemaImportPath);
    } catch (error) {
        console.error(`错误: ${error instanceof Error ? error.message : error}`);
        console.error('请先创建 Drizzle Schema 后再运行脚手架。');
        process.exit(1);
    };
    const files = renderBackendModule({
        slug: options.slug,
        tag: options.tag,
        schema,
    });
    console.log(`\n模块: ${options.slug}`);
    console.log(`Schema: ${schemaFilePath}`);
    console.log(`输出: ${moduleDir}\n`);
    for (const [filename, content] of Object.entries(files)) {
        const filePath = join(moduleDir, filename);
        console.log(`  + ${filename}`);
        if (options.dryRun) {
            console.log('--- preview ---');
            console.log(content.slice(0, 200) + (content.length > 200 ? '\n...(truncated)\n' : '\n'));
            continue;
        };
        mkdirSync(moduleDir, { recursive: true });
        writeFileSync(filePath, content, 'utf-8');
    };
    if (options.dryRun) {
        console.log('\n[dry-run] 未写入任何文件。');
    } else {
        console.log('\n✓ 后端模块脚手架生成完成。');
        console.log('  · 开发环境下 route.ts 会自动注册');
        console.log('  · 请用 AI 补充：字典、菜单/handoff SQL、特殊业务逻辑');
    };
};

main();