import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import {
    slugToCamel,
    slugToParts,
    slugToPascal,
    slugToPermissionPrefix,
    slugToSnake,
    slugToUrlPath,
} from '../../script/scaffold/naming';
import { parseSchemaFile, resolveSchemaPath } from '../../script/scaffold/schema-parser';
import { renderAdminPage } from '../../script/scaffold/admin-templates';
import { renderDto } from '../../script/scaffold/templates';

describe('scaffold naming', () => {
    test('slugToParts', () => {
        expect(slugToParts('business-goods')).toEqual({ group: 'business', name: 'goods' });
        expect(slugToParts('system-api')).toEqual({ group: 'system', name: 'api' });
    });

    test('slug conversions', () => {
        expect(slugToSnake('business-goods')).toBe('business_goods');
        expect(slugToPascal('business-goods')).toBe('BusinessGoods');
        expect(slugToCamel('business-goods')).toBe('businessGoods');
        expect(slugToUrlPath('business-goods')).toBe('/business/goods');
        expect(slugToPermissionPrefix('business-goods')).toBe('business:goods');
    });

    test('slugToParts rejects invalid slug', () => {
        expect(() => slugToParts('invalid')).toThrow();
    });
});

describe('scaffold schema-parser', () => {
    const serverRoot = join(import.meta.dir, '../..');
    const systemApiPath = join(serverRoot, 'database/schema/system_api.ts');

    test('parseSchemaFile system_api snapshot', () => {
        const parsed = parseSchemaFile(systemApiPath, 'system_api');
        expect(parsed.schemaVarName).toBe('systemApiSchema');
        expect(parsed.insertName).toBe('InsertSystemApi');
        expect(parsed.selectName).toBe('SelectSystemApi');
        expect(parsed.pkField.name).toBe('apiId');
        expect(parsed.pkField.tsType).toBe('number');
        expect(parsed.requiredFields).toEqual(['apiName', 'apiPath', 'apiMethod']);
        expect(parsed.businessFields.find((f) => f.name === 'apiName')?.label).toBe('API名称');
        expect(parsed.businessFields.find((f) => f.name === 'apiPath')?.label).toBe('API路径');
        expect(parsed.businessFields.find((f) => f.name === 'apiMethod')?.label).toBe('API方法');
        expect(parsed.listQueryFields.map((f) => f.name)).toEqual(['apiName', 'apiPath', 'apiMethod', 'status']);
        expect(parsed.formFields.map((f) => f.name)).toEqual(['apiName', 'apiPath', 'apiMethod', 'status']);
    });

    test('resolveSchemaPath', () => {
        const resolved = resolveSchemaPath(serverRoot, 'business-goods');
        expect(resolved.schemaFileName).toBe('business_goods');
        expect(resolved.schemaImportPath).toBe('business_goods');
        expect(resolved.schemaFilePath.replace(/\\/g, '/')).toEndWith('database/schema/business_goods.ts');
    });
});

describe('scaffold backend-templates', () => {
    const serverRoot = join(import.meta.dir, '../..');
    const systemApiPath = join(serverRoot, 'database/schema/system_api.ts');

    test('renderDto includes fieldLabels for required fields', () => {
        const schema = parseSchemaFile(systemApiPath, 'system_api');
        const dto = renderDto({ slug: 'system-api', tag: '系统API', schema });
        expect(dto).toContain("apiName: 'API名称'");
        expect(dto).toContain("apiPath: 'API路径'");
        expect(dto).toContain("apiMethod: 'API方法'");
        expect(dto).toContain("apiName: 'string'");
        expect(dto).toContain('CrudDto.create(');
    });

    test('CrudDto.create with fieldLabels builds error messages', () => {
        const { CrudDto } = require('../../src/types/dto');
        const { InsertSystemApi, SelectSystemApi } = require('../../database/schema/system_api');
        const createDto = CrudDto.create(
            InsertSystemApi,
            SelectSystemApi,
            ['apiName', 'apiPath', 'apiMethod'],
            { apiName: 'API名称', apiPath: 'API路径', apiMethod: 'API方法' },
            { apiName: 'string', apiPath: 'string', apiMethod: 'string' },
        );
        const bodySchema = JSON.stringify(createDto.body);
        expect(bodySchema).toContain('API名称不能为空');
        expect(bodySchema).toContain('API路径不能为空');
        expect(bodySchema).toContain('API方法不能为空');
    });
});

describe('scaffold admin-templates', () => {
    const serverRoot = join(import.meta.dir, '../..');
    const systemApiPath = join(serverRoot, 'database/schema/system_api.ts');

    test('renderAdminPage produces five files', () => {
        const schema = parseSchemaFile(systemApiPath, 'system_api');
        const files = renderAdminPage({
            group: 'system',
            name: 'api',
            tag: '系统API',
            schema,
        });
        expect(Object.keys(files)).toHaveLength(5);
        expect(files['src/types/api/system-api.d.ts']).toContain('namespace SystemApi');
        expect(files['src/api/system/api.ts']).toContain("url: '/api/system/api/list'");
        expect(files['src/views/system/api/index.vue']).toContain('art-full-height');
    });
});
