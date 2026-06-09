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
