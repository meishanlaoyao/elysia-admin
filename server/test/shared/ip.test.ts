import { describe, expect, it } from 'bun:test';
import {
    GetClientOs,
    GetClientPlatform,
    GetClientType,
    IsPrivateIp,
    NormalizeIp,
} from '@/shared/ip';

describe('IsPrivateIp', () => {
    it('detects private IPv4', () => {
        expect(IsPrivateIp('127.0.0.1')).toBe(true);
        expect(IsPrivateIp('10.0.0.1')).toBe(true);
        expect(IsPrivateIp('192.168.1.1')).toBe(true);
        expect(IsPrivateIp('172.16.0.1')).toBe(true);
    });

    it('detects public IPv4', () => {
        expect(IsPrivateIp('8.8.8.8')).toBe(false);
    });

    it('detects loopback IPv6', () => {
        expect(IsPrivateIp('::1')).toBe(true);
    });

    it('returns false for non-string', () => {
        expect(IsPrivateIp(null as any)).toBe(false);
    });
});

describe('NormalizeIp', () => {
    it('maps IPv6 loopback to 127.0.0.1', () => {
        expect(NormalizeIp('::1')).toBe('127.0.0.1');
    });

    it('strips IPv4-mapped prefix', () => {
        expect(NormalizeIp('::ffff:192.168.1.1')).toBe('192.168.1.1');
    });

    it('returns 127.0.0.1 for empty', () => {
        expect(NormalizeIp('')).toBe('127.0.0.1');
    });
});

describe('GetClientType', () => {
    it('detects web browser', () => {
        const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
        expect(GetClientType(ua)).toBe('web');
    });

    it('returns unknown for empty', () => {
        expect(GetClientType('')).toBe('unknown');
    });
});

describe('GetClientPlatform', () => {
    it('detects WeChat', () => {
        expect(GetClientPlatform('Mozilla/5.0 MicroMessenger/8.0')).toBe('wechat');
    });

    it('detects Chrome', () => {
        const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
        expect(GetClientPlatform(ua)).toBe('chrome');
    });
});

describe('GetClientOs', () => {
    it('detects Windows', () => {
        const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
        expect(GetClientOs(ua)).toBe('Windows 10/11');
    });

    it('returns unknown for empty', () => {
        expect(GetClientOs('')).toBe('未知');
    });
});
