import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
    parseGroupNameArgs,
    renderAdminPage,
    slugFromGroupName,
} from './scaffold/admin-templates';
import { parseSchemaFile, resolveSchemaPath } from './scaffold/schema-parser';

interface CliOptions {
    group: string;
    name: string;
    tag: string;
    schemaOverride?: string;
    dryRun: boolean;
};

function printUsage(): void {
    console.log(`
用法: bun run create:page <group> <name> [选项]

示例:
  bun run create:page business goods --tag 商品管理
  bun run create:page system api --tag 系统API --dry-run

说明:
  在 admin/ 目录下生成 types、api、views 脚手架（脚本位于 server，输出到 ../admin）

选项:
  --tag <名称>       页面/模块中文名（必填）
  --schema <file>    Schema 文件名（不含 .ts，默认 {group}_{name}）
  --dry-run          仅预览，不写入文件
  --help             显示帮助
`);
};

function parseArgs(argv: string[]): CliOptions | null {
    if (argv.includes('--help')) {
        printUsage();
        return null;
    };
    const groupName = parseGroupNameArgs(argv);
    if (!groupName) {
        console.error('错误: 请提供 group 和 name，例如: business goods');
        printUsage();
        process.exit(1);
    };
    const tagIdx = argv.indexOf('--tag');
    const tag = tagIdx !== -1 ? argv[tagIdx + 1] : '';
    if (!tag) {
        console.error('错误: 请使用 --tag 指定页面名称');
        process.exit(1);
    };
    const schemaIdx = argv.indexOf('--schema');
    const schemaOverride = schemaIdx !== -1 ? argv[schemaIdx + 1] : undefined;
    const dryRun = argv.includes('--dry-run');
    return { ...groupName, tag, schemaOverride, dryRun };
};

function main(): void {
    const options = parseArgs(process.argv.slice(2));
    if (!options) return;
    const serverRoot = join(import.meta.dir, '..');
    const adminRoot = join(serverRoot, '..', 'admin');
    const slug = slugFromGroupName(options.group, options.name);
    const viewsDir = join(adminRoot, 'src/views', options.group, options.name);
    const typeFile = join(adminRoot, 'src/types/api', `${options.group}-${options.name}.d.ts`);
    const apiFile = join(adminRoot, 'src/api', options.group, `${options.name}.ts`);
    if (existsSync(viewsDir) || existsSync(typeFile) || existsSync(apiFile)) {
        console.error('错误: 目标页面或 API 文件已存在:');
        if (existsSync(viewsDir)) console.error(`  · ${viewsDir}`);
        if (existsSync(typeFile)) console.error(`  · ${typeFile}`);
        if (existsSync(apiFile)) console.error(`  · ${apiFile}`);
        process.exit(1);
    };
    const { schemaFilePath, schemaImportPath } = resolveSchemaPath(
        serverRoot,
        slug,
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
    const files = renderAdminPage({
        group: options.group,
        name: options.name,
        tag: options.tag,
        schema,
    });
    console.log(`\n页面: ${options.group}/${options.name}`);
    console.log(`Schema: ${schemaFilePath}`);
    console.log(`输出: ${adminRoot}\n`);
    for (const [relativePath, content] of Object.entries(files)) {
        const filePath = join(adminRoot, relativePath);
        console.log(`  + ${relativePath}`);
        if (options.dryRun) {
            console.log('--- preview ---');
            console.log(content.slice(0, 200) + (content.length > 200 ? '\n...(truncated)\n' : '\n'));
            continue;
        };
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, content, 'utf-8');
    };
    if (options.dryRun) {
        console.log('\n[dry-run] 未写入任何文件。');
    } else {
        console.log('\n✓ 后台页面脚手架生成完成。');
        console.log('  · 请在菜单管理或 handoff SQL 中配置 component 路径');
        console.log(`  · 建议 component: /${options.group}/${options.name}/index`);
        console.log('  · 请用 AI 补充：字典项、菜单/按钮权限 SQL、特殊业务逻辑');
        console.log('  · 运行 admin: pnpm dev 验证页面');
    };
};

main();