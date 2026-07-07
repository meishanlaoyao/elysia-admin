# Form Layout (Dialog / Drawer)

After logic is done, **MUST** review dialog (`ElDialog`) and drawer (`ElDrawer`) form layout — avoid sparse single-field rows or cramped single-column stacks.

Reference: [`admin/src/views/system/user/`](../admin/src/views/system/user/) — do NOT read all of `components/core`.

List/search quality: [AI_PAGE_QUALITY.md](./AI_PAGE_QUALITY.md).

---

## Principles

| Rule | Detail |
|------|--------|
| Two columns default | `ArtForm` `:span="12"` — two fields per row |
| Full width | Long text, remark, rich text → `span: 24` |
| Balanced density | 3–6 short fields in 2–3 rows, not 6 rows |
| Grouping | >8 fields: section titles or tabs if project has precedent |

---

## Field Type vs span

| Type | span | Notes |
|------|------|-------|
| Short input (name, code, number) | 12 | Pair with adjacent short field |
| Switch, status | 12 | Same row as name OK |
| Select, date | 12 | Two-column layout |
| Remark, description | 24 | `textarea`, full row |
| Rich text | 24 | `ArtWangEditor` |
| Image upload | 12 or 24 | By preview size |

---

## Anti-patterns — NEVER

```
❌ Single "name" field at span=24 with empty right half
❌ width=600px dialog with 10 fields all span=24 stacked
❌ 8 short fields span=12 but label wrap breaks layout (widen to 720px)
❌ Search vs dialog layout feels unrelated
```

---

## Dialog Width

| Field count | Width |
|-------------|-------|
| ≤4 short | `600px` |
| 5–8 | `720px`–`800px` |
| Rich text / tabs | `900px` or drawer |

Drawer: `size="50%"` or from `600px`; same span rules.

User reference dialog: `width="800px"`, `align-center`, `:span="12"`, `label-width="80px"`.

---

## ArtForm Example

```vue
<ArtForm
  ref="formRef"
  v-model="formData"
  :items="formItems"
  :rules="rules"
  :span="12"
  label-width="80px"
  :show-reset="false"
  :show-submit="false"
/>
```

```ts
const formItems = computed<FormItem[]>(() => [
  { label: '名称', key: 'name', type: 'input', props: { placeholder: '请输入' } },
  { label: '状态', key: 'status', type: 'switch' },
  { label: '类型', key: 'type', type: 'select', props: { /* dict options via useDictStore */ } },
  { label: '备注', key: 'remark', type: 'input', span: 24, props: { type: 'textarea', rows: 3 } },
])
```

---

## Dictionary Fields

- Options from dict API / `useDictStore` — **NEVER** hardcoded business `options`
- List `ElTag` / formatters: `getDictLabel`

---

## Pre-Delivery Checklist

- [ ] Dialog/drawer width matches field count
- [ ] Short fields two-column; long fields full row
- [ ] Consistent `label-width` (80–100px)
- [ ] Footer: cancel + submit, right-aligned in `dialog-footer`
- [ ] (Optional) Chrome DevTools MCP smoke

---

## Related

- [AI_PAGE_QUALITY.md](./AI_PAGE_QUALITY.md)
- [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md)