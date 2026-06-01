import { describe, expect, it } from 'bun:test';
import {
    IsEmail,
    IsIdCard,
    IsIpAddress,
    IsPhoneNumber,
    IsUrl,
} from '@/core/check';

describe('IsIpAddress', () => {
    it('accepts valid IPv4', () => {
        expect(IsIpAddress('192.168.1.1')).toBe(true);
        expect(IsIpAddress('0.0.0.0')).toBe(true);
        expect(IsIpAddress('255.255.255.255')).toBe(true);
    });

    it('rejects invalid IPv4', () => {
        expect(IsIpAddress('256.1.1.1')).toBe(false);
        expect(IsIpAddress('1.2.3')).toBe(false);
        expect(IsIpAddress('not-an-ip')).toBe(false);
    });
});

describe('IsPhoneNumber', () => {
    it('accepts mainland mobile', () => {
        expect(IsPhoneNumber('13800138000')).toBe(true);
        expect(IsPhoneNumber('19912345678')).toBe(true);
    });

    it('rejects invalid phone', () => {
        expect(IsPhoneNumber('12345678901')).toBe(false);
        expect(IsPhoneNumber('1380013800')).toBe(false);
        expect(IsPhoneNumber('')).toBe(false);
    });
});

describe('IsEmail', () => {
    it('accepts valid email', () => {
        expect(IsEmail('user@example.com')).toBe(true);
        expect(IsEmail('a.b_c@mail.co.uk')).toBe(true);
    });

    it('rejects invalid email', () => {
        expect(IsEmail('invalid')).toBe(false);
        expect(IsEmail('@example.com')).toBe(false);
    });
});

describe('IsUrl', () => {
    it('accepts http(s) URLs', () => {
        expect(IsUrl('https://example.com/path')).toBe(true);
        expect(IsUrl('http://foo.bar')).toBe(true);
    });

    it('rejects invalid URL', () => {
        expect(IsUrl('not a url')).toBe(false);
    });
});

describe('IsIdCard', () => {
    it('accepts 18-digit id card format', () => {
        expect(IsIdCard('110101199003074477')).toBe(true);
    });

    it('rejects invalid id card', () => {
        expect(IsIdCard('123')).toBe(false);
        expect(IsIdCard('')).toBe(false);
    });
});
