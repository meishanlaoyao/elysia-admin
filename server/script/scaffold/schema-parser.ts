import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isBaseSchemaField, slugToSnake } from './naming';

export type FieldTsType = 'number' | 'string' | 'boolean' | 'Date';

export interface SchemaField {
    name: string;
    tsType: FieldTsType;
    drizzleType: string;
    isPrimaryKey: boolean;
    isNotNull: boolean;
}

export interface ParsedSchema {
    schemaVarName: string;
    insertName: string;
    selectName: string;
    schemaImportPath: string;
    pkField: SchemaField;
    businessFields: SchemaField[];
    requiredFields: string[];
    listQueryFields: SchemaField[];
    formFields: SchemaField[];
}

const DRIZZLE_TYPE_MAP: Record<string, FieldTsType> = {
    bigserial: 'number',
    bigint: 'number',
    integer: 'number',
    numeric: 'number',
    serial: 'number',
    uuid: 'string',
    varchar: 'string',
    text: 'string',
    boolean: 'boolean',
    timestamp: 'Date',
};

const FIELD_LINE_RE = /^\s*(\w+):\s*(bigserial|uuid|varchar|boolean|bigint|integer|numeric|serial|text|timestamp)\(/;

function drizzleToTsType(drizzleType: string, isPrimaryKey: boolean, fieldName: string): FieldTsType {
    if (drizzleType === 'varchar' && isPrimaryKey) return 'string';
    if (fieldName.endsWith('Id') && drizzleType === 'bigint') return 'number';
    return DRIZZLE_TYPE_MAP[drizzleType] ?? 'string';
}

function extractMainPgTableBody(content: string): string {
    const start = content.indexOf('pgTable(');
    if (start === -1) throw new Error('未找到 pgTable 定义');
    const bodyStart = content.indexOf('{', start);
    if (bodyStart === -1) throw new Error('未找到 pgTable 字段块');

    let depth = 0;
    for (let i = bodyStart; i < content.length; i++) {
        const ch = content[i];
        if (ch === '{') depth++;
        if (ch === '}') {
            depth--;
            if (depth === 0) return content.slice(bodyStart + 1, i);
        }
    }
    throw new Error('pgTable 字段块未闭合');
}

function parseFields(tableBody: string): SchemaField[] {
    const fields: SchemaField[] = [];
    const lines = tableBody.split('\n');

    for (const line of lines) {
        if (line.includes('...BaseSchema')) continue;
        const match = line.match(FIELD_LINE_RE);
        if (!match) continue;

        const [, name, drizzleType] = match;
        const isPrimaryKey = line.includes('.primaryKey()');
        const isNotNull = line.includes('.notNull()');
        fields.push({
            name,
            drizzleType,
            isPrimaryKey,
            isNotNull,
            tsType: drizzleToTsType(drizzleType, isPrimaryKey, name),
        });
    }

    return fields;
}

function parseExportNames(content: string): Pick<ParsedSchema, 'schemaVarName' | 'insertName' | 'selectName'> {
    const schemaMatch = content.match(/export const (\w+Schema)\s*=\s*pgTable/);
    const insertMatch = content.match(/export const (Insert\w+)\s*=/);
    const selectMatch = content.match(/export const (Select\w+)\s*=/);

    if (!schemaMatch || !insertMatch || !selectMatch) {
        throw new Error('未找到 schema / Insert / Select 导出名');
    }

    return {
        schemaVarName: schemaMatch[1],
        insertName: insertMatch[1],
        selectName: selectMatch[1],
    };
}

export function parseSchemaFile(schemaFilePath: string, schemaImportPath: string): ParsedSchema {
    if (!existsSync(schemaFilePath)) {
        throw new Error(`Schema 文件不存在: ${schemaFilePath}`);
    }

    const content = readFileSync(schemaFilePath, 'utf-8');
    const exportNames = parseExportNames(content);
    const tableBody = extractMainPgTableBody(content);
    const allFields = parseFields(tableBody);

    const pkField = allFields.find((f) => f.isPrimaryKey);
    if (!pkField) throw new Error('未找到主键字段 (.primaryKey())');

    const businessFields = allFields.filter((f) => !f.isPrimaryKey && !isBaseSchemaField(f.name));
    const requiredFields = businessFields.filter((f) => f.isNotNull).map((f) => f.name);
    const listQueryFields = businessFields.filter((f) =>
        f.drizzleType === 'varchar' || f.drizzleType === 'text' || f.drizzleType === 'boolean'
    );
    const formFields = businessFields.filter((f) => f.name !== 'password');

    return {
        ...exportNames,
        schemaImportPath,
        pkField,
        businessFields,
        requiredFields,
        listQueryFields,
        formFields,
    };
}

export function resolveSchemaPath(serverRoot: string, slug: string, schemaOverride?: string): {
    schemaFileName: string;
    schemaFilePath: string;
    schemaImportPath: string;
} {
    const schemaFileName = schemaOverride ?? slugToSnake(slug);
    const schemaFilePath = join(serverRoot, 'database/schema', `${schemaFileName}.ts`);
    const schemaImportPath = schemaFileName;
    return { schemaFileName, schemaFilePath, schemaImportPath };
}
