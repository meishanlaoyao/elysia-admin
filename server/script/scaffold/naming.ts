const BASE_SCHEMA_FIELDS = new Set([
    'createTime',
    'createBy',
    'updateTime',
    'updateBy',
    'delFlag',
    'remark',
]);

export { BASE_SCHEMA_FIELDS };

export function slugToParts(slug: string): { group: string; name: string } {
    const idx = slug.indexOf('-');
    if (idx <= 0 || idx === slug.length - 1) {
        throw new Error(`模块 slug 格式应为 group-name，例如 business-goods，当前: ${slug}`);
    }
    return { group: slug.slice(0, idx), name: slug.slice(idx + 1) };
}

export function slugToSnake(slug: string): string {
    return slug.replace(/-/g, '_');
}

export function slugToPascal(slug: string): string {
    return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

export function slugToCamel(slug: string): string {
    const pascal = slugToPascal(slug);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function slugToUrlPath(slug: string): string {
    const { group, name } = slugToParts(slug);
    return `/${group}/${name}`;
}

export function slugToPermissionPrefix(slug: string): string {
    const { group, name } = slugToParts(slug);
    return `${group}:${name}`;
}

export function slugToModuleVarName(slug: string): string {
    return `${slugToPascal(slug)}Module`;
}

export function isBaseSchemaField(fieldName: string): boolean {
    return BASE_SCHEMA_FIELDS.has(fieldName);
}

export function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function toApiNamespace(group: string, name: string): string {
    return `${capitalize(group)}${capitalize(name)}`;
}

export function toEntityName(name: string): string {
    return capitalize(name);
}

export function toTypeFileName(group: string, name: string): string {
    return `${group}-${name}`;
}
