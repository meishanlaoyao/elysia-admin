import { describe, expect, it } from 'bun:test';
import { BcryptCompare, BcryptHash } from '@/shared/bcrypt';

describe('bcrypt', () => {
    it('hash and verify match', async () => {
        const plain = 'test-password-123';
        const hash = await BcryptHash(plain);
        expect(hash).not.toBe(plain);
        expect(await BcryptCompare(plain, hash)).toBe(true);
    });

    it('rejects wrong password', async () => {
        const hash = await BcryptHash('correct');
        expect(await BcryptCompare('wrong', hash)).toBe(false);
    });
});