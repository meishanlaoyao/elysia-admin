# AI Frontend Generation Rules (STRICT MODE)

This project uses Vue3 + TypeScript + Composition API.

AI must strictly follow this architecture.

============================================================
1️⃣ Global Folder Structure
============================================================

admin/
    src/
        types/
            api/
                {module}.d.ts
        api/
            {group}/
                {module}.ts
        views/
            {group}/
                {module}/
                    index.vue
                    modules/
                        {module}-search.vue
                        {module}-dialog.vue

Do NOT change folder structure.
Do NOT flatten components.
Do NOT mix API inside view.

============================================================
2️⃣ Type Declaration Rules
============================================================

File:
types/api/{module}.d.ts

Structure:

declare namespace Api {
    namespace {Group}{Module} {

        interface {Module}ListItem {
            ...
        }

        type {Module}List =
            Api.Common.PaginatedResponse<{Module}ListItem>

        type {Module}SearchParams =
            Partial<
                Pick<{Module}ListItem, 'field1' | 'field2'>
                & Api.Common.CommonSearchParams
            >
    }
}

Rules:
- All backend response types must be declared here.
- No inline type in component.
- No duplicate interface.
- List must use PaginatedResponse.

============================================================
3️⃣ API Layer Rules
============================================================

File:
api/{group}/{module}.ts

Must contain:

fetchCreate{Module}
fetchGet{Module}List
fetchUpdate{Module}
fetchDelete{Module}

Example pattern:

export function fetchCreateXXX(data: Api.GroupXXX.XXXListItem) {
    return request.post({
        url: '/api/group/xxx',
        data,
        showSuccessMessage: true,
        showErrorMessage: true
    })
}

Rules:
- Only HTTP wrapper
- No business logic
- No data transform
- No conditional logic
- Always use request instance
- No axios direct usage

============================================================
4️⃣ Page Container Rules (index.vue)
============================================================

Location:
views/{group}/{module}/index.vue

Responsibility:
- Page layout
- useTable hook
- columnsFactory
- Dialog open/close
- Selection handling
- Batch delete
- Call refreshData()

Must:
- Use useTable
- Use columnsFactory
- Import fetchGetXXXList
- Call refreshData() after create/update/delete
- Keep page thin

Forbidden:
- Form validation
- Inline API logic
- Complex transformation
- Business algorithm
- Duplicated code

index.vue = container only.

============================================================
5️⃣ Search Component Rules
============================================================

File:
{module}-search.vue

Responsibility:
- Search form only
- Emit search
- Emit reset

Must:
- Use ArtSearchBar
- Use v-model
- Emit:
    update:modelValue
    search
    reset

Forbidden:
- API call
- Data mutation outside v-model
- Business logic
- Dialog control

Search component must be stateless.

============================================================
6️⃣ Dialog Component Rules
============================================================

File:
{module}-dialog.vue

Responsibility:
- Add/Edit form
- Validation
- Call create/update API
- Emit submit

Props:
- visible: boolean
- type: 'add' | 'edit'
- data?: Partial<{Module}ListItem>

Emits:
- update:visible
- submit

Must:
- Use ArtForm
- Reset form on close
- Initialize data on open
- Call fetchCreateXXX / fetchUpdateXXX

Forbidden:
- Table refresh logic
- Query logic
- Batch operation
- Complex business logic

Dialog = form only.

============================================================
7️⃣ Naming Rules
============================================================

Module name must be lowercase in folder:
job

Type namespace:
Api.MonitorJob

API function:
fetchCreateJob
fetchGetJobList
fetchUpdateJob
fetchDeleteJob

Search params type:
JobSearchParams

List type:
JobList

List item type:
JobListItem

============================================================
8️⃣ CRUD Standard Pattern
============================================================

Every module must support:

- Create
- Query list (paginated)
- Update
- Delete (single + batch)

Pattern must remain identical across modules.

============================================================
9️⃣ Forbidden Behaviors
============================================================

AI must NEVER:

- Mix search + dialog into index
- Put API inside component
- Change request instance
- Rename API pattern
- Skip type declaration
- Hardcode response structure
- Write business logic in page container
- Use any outside library without permission

============================================================
🔟 Code Style
============================================================

- Use Composition API
- Use script setup
- Use TypeScript
- Use async/await
- No any
- No magic number
- No duplicated logic
- Keep modules consistent

============================================================
END
============================================================