import type { ParsedSchema, SchemaField } from './schema-parser';
import {
    slugToModuleVarName,
    slugToPermissionPrefix,
    slugToUrlPath,
} from './naming';

function toDtoTsType(tsType: SchemaField['tsType']): 'string' | 'number' | 'boolean' {
    if (tsType === 'number') return 'number';
    if (tsType === 'boolean') return 'boolean';
    return 'string';
}

function listDtoField(field: SchemaField): string {
    const desc = field.label;
    if (field.tsType === 'boolean') {
        return `${field.name}: t.Optional(t.Boolean({ description: "${desc}" }))`;
    }
    return `${field.name}: t.Optional(t.String({ description: "${desc}" }))`;
}

function buildFieldLabelsBlock(schema: ParsedSchema): string {
    if (schema.requiredFields.length === 0) return '';
    const lines = schema.requiredFields.map((name) => {
        const field = schema.businessFields.find((f) => f.name === name)!;
        return `        ${name}: '${field.label}',`;
    });
    return `,\n    {\n${lines.join('\n')}\n    }`;
}

function buildFieldTypesBlock(schema: ParsedSchema): string {
    if (schema.requiredFields.length === 0) return '';
    const lines = schema.requiredFields.map((name) => {
        const field = schema.businessFields.find((f) => f.name === name)!;
        return `        ${name}: '${toDtoTsType(field.tsType)}',`;
    });
    return `,\n    {\n${lines.join('\n')}\n    }`;
}

function queryBuilderLine(field: SchemaField): string {
    if (field.tsType === 'boolean') {
        return `.eq('${field.name}', ${field.name})`;
    }
    return `.like('${field.name}', ${field.name})`;
}

function listQueryDestructuring(fields: SchemaField[]): string {
    const names = fields.map((f) => f.name);
    if (names.length === 0) return '';
    return names.map((n) => `        ${n},`).join('\n');
}

export interface BackendTemplateContext {
    slug: string;
    tag: string;
    schema: ParsedSchema;
}

export function renderRoute(ctx: BackendTemplateContext): string {
    const { slug, tag, schema } = ctx;
    const moduleVar = slugToModuleVarName(slug);
    const urlPath = slugToUrlPath(slug);
    const perm = slugToPermissionPrefix(slug);

    return `import type { IRouteModule } from "@/types/route";
import { create, findList, findOne, remove, update } from './handle';
import { CreateDto, ListDto, UpdateDto } from "./dto";

const ${moduleVar}: IRouteModule = {
    tags: '${tag}',
    routes: [
        { url: '${urlPath}', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: '${perm}:create' } },
        { url: '${urlPath}/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: '${perm}:query' } },
        { url: '${urlPath}/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, permission: '${perm}:query' } },
        { url: '${urlPath}', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: '${perm}:update' } },
        { url: '${urlPath}/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: '${perm}:delete' } },
    ],
};

export default ${moduleVar};
`;
}

export function renderDto(ctx: BackendTemplateContext): string {
    const { schema } = ctx;
    const required = schema.requiredFields.map((f) => `'${f}'`).join(', ');
    const listFields = schema.listQueryFields.map(listDtoField).join(',\n        ');
    const fieldLabelsBlock = buildFieldLabelsBlock(schema);
    const fieldTypesBlock = buildFieldTypesBlock(schema);

    const listBlock = listFields
        ? `,\n    {\n        ${listFields},\n    }`
        : '';

    return `import { t } from 'elysia';
import { ${schema.insertName}, ${schema.selectName} } from "@database/schema/${schema.schemaImportPath}";
import { CrudDto } from '@/types/dto';

export const CreateDto = CrudDto.create(
    ${schema.insertName},
    ${schema.selectName},
    [${required}]${fieldLabelsBlock}${fieldTypesBlock}
);

export const UpdateDto = CrudDto.update(${schema.selectName}, '${schema.pkField.name}');

export const ListDto = CrudDto.list(
    ${schema.selectName}${listBlock}
);
`;
}

export function renderHandle(ctx: BackendTemplateContext): string {
    const { schema } = ctx;
    const pk = schema.pkField;
    const idParse = pk.tsType === 'number'
        ? 'Number(ctx.params.id)'
        : 'ctx.params.id as string';

    const listDestructure = listQueryDestructuring(schema.listQueryFields);
    const queryBuilderLines = schema.listQueryFields.map(queryBuilderLine).join('\n        ');

    return `import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { ${schema.schemaVarName} } from '@database/schema/${schema.schemaImportPath}';

export async function create(ctx: AppContext) {
    await InsertOne(${schema.schemaVarName}, ctx);
    return BaseResultData.ok();
}

export async function findList(ctx: AppContext) {
    const {
        pageNum = 1,
        pageSize = 10,
        orderByColumn = "createTime",
        sortRule = "desc",
        startTime,
        endTime,
${listDestructure}
    } = ctx.query;
    const whereCondition = CreateQueryBuilder(${schema.schemaVarName})
        .eq('delFlag', false)
        ${queryBuilderLines}
        .dateRange('createTime', startTime, endTime)
        .build();
    const res = await FindPage(${schema.schemaVarName}, whereCondition, {
        pageNum,
        pageSize,
        orderByColumn,
        sortRule,
    });
    return BaseResultData.ok(res);
}

export async function findOne(ctx: AppContext) {
    const id = ${idParse};
    const data = await FindOneByKey(${schema.schemaVarName}, '${pk.name}', id);
    if (!data || data.delFlag) return BaseResultData.fail(404);
    return BaseResultData.ok(data);
}

export async function update(ctx: AppContext) {
    await UpdateByKey(${schema.schemaVarName}, '${pk.name}', ctx);
    return BaseResultData.ok();
}

export async function remove(ctx: AppContext) {
    await SoftDeleteByKeys(${schema.schemaVarName}, '${pk.name}', ctx);
    return BaseResultData.ok();
}
`;
}

export function renderBackendModule(ctx: BackendTemplateContext): Record<string, string> {
    return {
        'route.ts': renderRoute(ctx),
        'dto.ts': renderDto(ctx),
        'handle.ts': renderHandle(ctx),
    };
}
