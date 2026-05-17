/** 外链 target/rel，避免模板里绑定 undefined 触发严格类型检查 */
export function eaExternalLinkAttrs(external?: boolean) {
  return external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {}
}
