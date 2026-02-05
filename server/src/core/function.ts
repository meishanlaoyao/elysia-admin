/**
 * 树节点配置选项
 */
export interface TreeOptions {
    /** 主键字段名，默认 'id' */
    idKey?: string;
    /** 父节点字段名，默认 'parentId' */
    parentKey?: string;
    /** 子节点字段名，默认 'children' */
    childrenKey?: string;
    /** 根节点的父ID值，默认 0 */
    rootValue?: number | null;
    /** 排序字段名，如果提供则按此字段升序排序 */
    sortKey?: string;
    /** 需要从结果中移除的字段名数组 */
    omitKeys?: string[];
}

/**
 * 列表转树结构
 * @param list 扁平列表数据
 * @param options 配置选项
 * @returns 树结构数据
 */
export function listToTree<T extends Record<string, any>>(
    list: T[],
    options: TreeOptions = {}
): T[] {
    if (list.length === 0) return [];
    const {
        idKey = 'id',
        parentKey = 'parentId',
        childrenKey = 'children',
        rootValue = 0,
        sortKey,
        omitKeys = [],
    } = options;
    const hasOmitKeys = omitKeys.length > 0;
    const omitKeysSet = hasOmitKeys ? new Set(omitKeys) : null;
    const map: Record<any, any> = {};
    const result: T[] = [];
    for (let i = 0; i < list.length; i++) {
        const original: any = list[i];
        const node: any = {};
        for (const key in original) {
            if (!hasOmitKeys || !omitKeysSet!.has(key)) {
                node[key] = original[key];
            }
        };
        node[childrenKey] = [];
        map[node[idKey]] = node;
    };
    for (const id in map) {
        const node = map[id];
        const parentId = node[parentKey];
        if (parentId === rootValue || parentId === null) {
            result.push(node);
        } else {
            const parent = map[parentId];
            if (parent) {
                parent[childrenKey].push(node);
            } else {
                result.push(node);
            };
        };
    };
    if (sortKey) {
        const sortNodes = (nodes: any[]) => {
            nodes.sort((a, b) => (a[sortKey] ?? 0) - (b[sortKey] ?? 0));
            for (let i = 0; i < nodes.length; i++) {
                const children = nodes[i][childrenKey];
                if (children?.length > 0) {
                    sortNodes(children);
                }
            }
        };
        sortNodes(result);
    };
    return result;
};

/**
 * 树结构转列表
 * @param tree 树结构数据
 * @param options 配置选项
 * @returns 扁平列表数据
 */
export function treeToList<T extends Record<string, any>>(
    tree: T[],
    options: TreeOptions = {}
): T[] {
    if (tree.length === 0) return [];
    const { childrenKey = 'children' } = options;
    const result: T[] = [];
    function traverse(nodes: T[]) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const children = node[childrenKey];
            const item = { ...node };
            delete item[childrenKey];
            result.push(item as T);
            if (children?.length > 0) {
                traverse(children);
            };
        };
    };
    traverse(tree);
    return result;
};

/**
 * 对对象中的敏感字段进行脱敏（值替换为 '***'）
 * @param obj - 原始对象
 * @param sensitiveFields - 敏感字段名列表（匹配时不区分大小写）
 * @returns 脱敏后的新对象（深拷贝，不修改原对象）
 */
export function SanitizeObject<T extends Record<string, any>>(
    obj: T,
    sensitiveFields: string[]
): T {
    const sensitiveSet = new Set(sensitiveFields.map(field => field.toLowerCase()));
    function walk(current: any): any {
        if (current === null || typeof current !== 'object') return current;
        if (Array.isArray(current)) return current.map(item => walk(item));
        const result: Record<string, any> = {};
        for (const key in current) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                const isSensitive = sensitiveSet.has(key.toLowerCase());
                result[key] = isSensitive ? '***' : walk(current[key]);
            };
        };
        return result;
    };
    return walk(obj) as T;
};