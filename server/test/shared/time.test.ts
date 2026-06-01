import { describe, expect, it } from 'bun:test';
import { ConvertTimeToSecond, FormatTime } from '@/shared/time';

describe('ConvertTimeToSecond', () => {
    it('parses combined units', () => {
        expect(ConvertTimeToSecond('1d2h3m4s')).toBe(86400 + 7200 + 180 + 4);
    });

    it('parses single unit', () => {
        expect(ConvertTimeToSecond('30s')).toBe(30);
        expect(ConvertTimeToSecond('2h')).toBe(7200);
    });

    it('returns 0 for empty or no matches', () => {
        expect(ConvertTimeToSecond('')).toBe(0);
        expect(ConvertTimeToSecond('invalid')).toBe(0);
    });
});

describe('FormatTime', () => {
    it('formats date string', () => {
        expect(FormatTime('2024-01-15 10:00:00')).toBe('2024-01-15 10:00:00');
    });

    it('returns empty for falsy input', () => {
        expect(FormatTime('')).toBe('');
    });
});
