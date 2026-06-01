import { describe, expect, it } from 'bun:test';
import { BaseResultData } from '@/core/result';

describe('BaseResultData', () => {
    it('ok returns 200 with data', () => {
        const res = BaseResultData.ok({ id: 1 }, '成功');
        expect(res.code).toBe(200);
        expect(res.msg).toBe('成功');
        expect(res.data).toEqual({ id: 1 });
    });

    it('ok defaults data to null', () => {
        const res = BaseResultData.ok();
        expect(res.code).toBe(200);
        expect(res.data).toBeNull();
    });

    it('fail returns error shape', () => {
        const res = BaseResultData.fail(400, '参数错误');
        expect(res.code).toBe(400);
        expect(res.msg).toBe('参数错误');
        expect(res.data).toBeNull();
    });

    it('fail with Error uses message', () => {
        const res = BaseResultData.fail(404, new Error('未找到'));
        expect(res.code).toBe(404);
        expect(res.msg).toBe('未找到');
    });
});
