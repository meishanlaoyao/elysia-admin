import { describe, expect, it } from 'bun:test';
import { CreateQueryBuilder } from '@/core/database/repository';
import { systemDictDataSchema } from '@database/schema/system_dict';

describe('QueryBuilder', () => {
    it('returns undefined when no conditions', () => {
        expect(CreateQueryBuilder(systemDictDataSchema).build()).toBeUndefined();
    });

    it('skips eq for undefined, null, and empty string', () => {
        const where = CreateQueryBuilder(systemDictDataSchema)
            .eq('dictType', undefined)
            .eq('dictLabel', null)
            .eq('dictValue', '')
            .build();
        expect(where).toBeUndefined();
    });

    it('includes eq for false boolean', () => {
        const where = CreateQueryBuilder(systemDictDataSchema)
            .eq('delFlag', false)
            .build();
        expect(where).toBeDefined();
    });

    it('chains multiple conditions with AND', () => {
        const where = CreateQueryBuilder(systemDictDataSchema)
            .eq('delFlag', false)
            .eq('dictType', 'sys_user_sex')
            .like('dictLabel', '男')
            .build();
        expect(where).toBeDefined();
    });

    it('skips like for empty value', () => {
        const where = CreateQueryBuilder(systemDictDataSchema)
            .eq('delFlag', false)
            .like('dictLabel', '')
            .build();
        expect(where).toBeDefined();
    });

    it('skips in for empty array', () => {
        const where = CreateQueryBuilder(systemDictDataSchema)
            .in('dictCode', [])
            .eq('delFlag', false)
            .build();
        expect(where).toBeDefined();
    });

    it('dateRange with only startTime', () => {
        const where = CreateQueryBuilder(systemDictDataSchema)
            .dateRange('createTime', '2024-01-01', undefined)
            .build();
        expect(where).toBeDefined();
    });
});
