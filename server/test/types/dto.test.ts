import { describe, expect, it } from 'bun:test';
import { ParseDateFields } from '@/types/dto';

describe('ParseDateFields', () => {
    it('converts string dates to Date', () => {
        const data = {
            createTime: '2024-06-01T00:00:00.000Z',
            updateTime: '2024-06-02T00:00:00.000Z',
        };
        const result = ParseDateFields({ ...data });
        expect(result.createTime).toBeInstanceOf(Date);
        expect(result.updateTime).toBeInstanceOf(Date);
    });

    it('leaves existing Date unchanged', () => {
        const d = new Date('2024-01-01');
        const result = ParseDateFields({ createTime: d });
        expect(result.createTime).toBe(d);
    });

    it('handles missing date fields', () => {
        const result = ParseDateFields({ name: 'test' });
        expect(result.name).toBe('test');
        expect(result.createTime).toBeUndefined();
    });
});
