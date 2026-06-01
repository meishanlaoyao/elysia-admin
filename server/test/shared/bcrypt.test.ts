import { describe, expect, it } from 'bun:test';
import { BcryptCompare, BcryptHash } from '@/shared/bcrypt';

describe('bcrypt', () => {
    it('hash and verify match', () => {
        const plain = 'test-password-123';
        const hash = BcryptHash(plain);
        expect(hash).not.toBe(plain);
        expect(BcryptCompare(plain, hash)).toBe(true);
    });

    it('rejects wrong password', () => {
        const hash = BcryptHash('correct');
        expect(BcryptCompare('wrong', hash)).toBe(false);
    });
});
