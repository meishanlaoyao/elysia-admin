# Admin Page Quality (List / Search / Dialog)

Apply after business logic works. Reference: `admin/src/views/system/user/` only — do NOT scan `components/core/`.

Form span rules: [AI_UI_LAYOUT.md](./AI_UI_LAYOUT.md).

---

## List Page (`index.vue`) — MUST

| Rule | Detail |
|------|--------|
| Page shell | Root `div` with classes `xxx-page art-full-height` |
| Card wrapper | `ElCard.art-table-card` with `shadow="never"` wraps table + dialog |
| Search placement | Search component **above** the card, not inside it |
| Table header | `ArtTableHeader` with `:loading` and `@refresh="refreshData"` |
| Primary actions | `#left` slot: `ElSpace wrap` + `ElButton` with `v-auth` |
| Column order | `selection` → `index` (width 60, label 序号) → data columns → `operation` |
| Operation column | `fixed: 'right'`, `width: 120`–`160` |
| Permission buttons | `auth.hasAuth('group:name:action')` + `ArtButtonTable` |
| Date columns | `dayjs` format `YYYY-MM-DD HH:mm:ss` when showing datetime |

---

## Boolean Status Columns

Use `ElTag` with semantic colors:

```ts
formatter: (row) => h(ElTag, { type: row.status ? 'success' : 'danger' }, () => row.status ? '启用' : '停用')
```

For business types backed by dict — use `getDictLabel` instead (see below).

---

## Dict Integration — MUST (no hardcoded business enums)

**NEVER** hardcode business enum `options` in search or dialog when a dict type exists.

### Setup (index, search, dialog)

```ts
import { useDictStore } from '@/store/modules/dict'

const dictStore = useDictStore()
const { business_goods_status } = dictStore.getDictData(['business_goods_status'])
```

### Table column

```ts
formatter: (row) => dictStore.getDictLabel('business_goods_status', row.status)
```

### Search / dialog select

```ts
props: {
  placeholder: '请选择状态',
  options: business_goods_status.value.map((item) => ({
    label: item.dictLabel,
    value: item.dictValue
  }))
}
```

Align `dict_type` with Postgres `system_dict_type` / handoff SQL. See [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md).

---

## Search (`*-search.vue`) — MUST

- Use `ArtSearchBar` with `v-model`, `@search`, `@reset`
- Typically **2–4** filters; multiple fields per row (ArtSearchBar handles layout)
- **NEVER** a single short field spanning full width alone
- Boolean status (enable/disable) may use fixed true/false options
- Business types **MUST** use `dictStore.getDictData`

---

## Dialog / Drawer — MUST

| Setting | Value |
|---------|-------|
| Width | ≤4 short fields: `600px`; 5–8 fields: `720px`–`800px`; rich text: `900px` or drawer |
| Align | `align-center` on `ElDialog` |
| Form | `ArtForm` with `:span="12"`, `label-width="80px"` |
| Footer | Cancel + primary Submit, right-aligned in `div.dialog-footer` |
| Reset | Call `formRef.reset()` on `@closed` |

Long fields (remark, rich text): `span: 24`.

---

## Anti-patterns — NEVER

- Table without `art-full-height` / `art-table-card` shell
- Operation column not fixed right on wide tables
- Business enum hardcoded in `formItems` while dict exists in DB
- Dialog `width="600px"` with 10+ fields all `span: 24`
- Missing `v-auth` on create button when route has permission

---

## Pre-delivery UI Checklist

- [ ] Page shell matches user reference layout
- [ ] Columns sensible widths; operation fixed right
- [ ] Dict fields use `useDictStore` (not hardcoded options)
- [ ] Dialog span / width balanced (see AI_UI_LAYOUT.md)
- [ ] Permission strings match backend `meta.permission`
- [ ] (Optional) Chrome DevTools MCP smoke test

---

## Related

- [AI_UI_LAYOUT.md](./AI_UI_LAYOUT.md) — form span rules
- [AI_CODE_EXAMPLES_BACKEND.md](./AI_CODE_EXAMPLES_BACKEND.md) / [AI_CODE_EXAMPLES_FRONTEND.md](./AI_CODE_EXAMPLES_FRONTEND.md) — copy-paste templates (section only)
- [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md) — full SOP