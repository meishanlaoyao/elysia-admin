import { describe, expect, it } from 'bun:test';
import {
    IsStringifiedObjectOrArray,
    ListToTree,
    SanitizeObject,
    TreeToList,
} from '@/core/function';

describe('ListToTree', () => {
    it('builds tree from flat list', () => {
        const list = [
            { id: 1, parentId: 0, name: 'root' },
            { id: 2, parentId: 1, name: 'child' },
        ];
        const tree = ListToTree(list, { idKey: 'id', parentKey: 'parentId', rootValue: 0 });
        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe(1);
        expect(tree[0].children).toHaveLength(1);
        expect(tree[0].children[0].id).toBe(2);
    });

    it('sorts by sortKey', () => {
        const list = [
            { id: 1, parentId: 0, sort: 2 },
            { id: 2, parentId: 0, sort: 1 },
        ];
        const tree = ListToTree(list, { idKey: 'id', parentKey: 'parentId', rootValue: 0, sortKey: 'sort' });
        expect(tree[0].id).toBe(2);
        expect(tree[1].id).toBe(1);
    });

    it('omits specified keys', () => {
        const list = [{ id: 1, parentId: 0, secret: 'x' }];
        const tree = ListToTree(list, { idKey: 'id', parentKey: 'parentId', rootValue: 0, omitKeys: ['secret'] });
        expect(tree[0].secret).toBeUndefined();
    });

    it('promotes orphan nodes to root', () => {
        const list = [{ id: 99, parentId: 999, name: 'orphan' }];
        const tree = ListToTree(list, { idKey: 'id', parentKey: 'parentId', rootValue: 0 });
        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe(99);
    });

    it('returns empty for empty list', () => {
        expect(ListToTree([])).toEqual([]);
    });
});

describe('TreeToList', () => {
    it('flattens tree', () => {
        const tree = [
            {
                id: 1,
                children: [{ id: 2, children: [] }],
            },
        ];
        const list = TreeToList(tree as any, { childrenKey: 'children' });
        expect(list).toHaveLength(2);
        expect(list.map((n) => n.id)).toEqual([1, 2]);
        expect(list[0].children).toBeUndefined();
    });
});

describe('SanitizeObject', () => {
    it('masks sensitive fields case-insensitively', () => {
        const obj = { user: 'a', Password: 'secret', nested: { token: 't' } };
        const out = SanitizeObject(obj, ['password', 'token']);
        expect(out.Password).toBe('***');
        expect(out.nested.token).toBe('***');
        expect(out.user).toBe('a');
        expect(obj.Password).toBe('secret');
    });
});

describe('IsStringifiedObjectOrArray', () => {
    it('returns true for object/array JSON', () => {
        expect(IsStringifiedObjectOrArray('{"a":1}')).toBe(true);
        expect(IsStringifiedObjectOrArray('[1,2]')).toBe(true);
    });

    it('returns false for primitives or invalid', () => {
        expect(IsStringifiedObjectOrArray('"hello"')).toBe(false);
        expect(IsStringifiedObjectOrArray('123')).toBe(false);
        expect(IsStringifiedObjectOrArray(null)).toBe(false);
        expect(IsStringifiedObjectOrArray('not json')).toBe(false);
    });
});
