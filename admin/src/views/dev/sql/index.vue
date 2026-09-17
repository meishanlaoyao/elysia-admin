<template>
    <div ref="pageRef" class="sql-studio art-full-height">
        <div class="sql-studio__shell">
            <!-- Top bar -->
            <header class="sql-bar">
                <div class="sql-bar__brand">
                    <span class="sql-bar__mark" aria-hidden="true" />
                    <div class="sql-bar__titles">
                        <h1 class="sql-bar__title">SQL Console</h1>
                        <p class="sql-bar__sub">开发环境直连查询</p>
                    </div>
                </div>

                <div class="sql-bar__status" :class="`is-${runState}`">
                    <span class="sql-bar__dot" />
                    <span>{{ statusLabel }}</span>
                </div>

                <div class="sql-bar__actions">
                    <button type="button" class="sql-btn sql-btn--ghost" :disabled="!sqlText.trim()"
                        @click="handleClear">
                        <ArtSvgIcon icon="ri:eraser-line" />
                        <span>清空</span>
                    </button>
                    <button type="button" class="sql-btn sql-btn--ghost" :disabled="!sqlText.trim()"
                        @click="handleCopy">
                        <ArtSvgIcon :icon="copied ? 'ri:check-line' : 'ri:file-copy-line'" />
                        <span>{{ copied ? '已复制' : '复制' }}</span>
                    </button>
                    <button type="button" class="sql-btn sql-btn--run" :class="{ 'is-loading': loading }"
                        :disabled="loading || !sqlText.trim()" @click="handleExecute">
                        <span class="sql-btn__glow" aria-hidden="true" />
                        <ArtSvgIcon :icon="loading ? 'ri:loader-4-line' : 'ri:play-fill'"
                            :class="{ 'is-spin': loading }" />
                        <span>{{ loading ? '执行中' : '执行' }}</span>
                        <kbd class="sql-kbd">{{ modKey }}↵</kbd>
                    </button>
                </div>
            </header>

            <!-- Editor -->
            <section class="sql-editor" :style="{ flex: `${editorRatio} 1 0` }">
                <div class="sql-editor__chrome">
                    <div class="sql-editor__tabs">
                        <span class="sql-editor__tab is-active">
                            <ArtSvgIcon icon="ri:terminal-box-line" />
                            query.sql
                        </span>
                    </div>
                    <div class="sql-editor__meta">
                        <span>{{ lineCount }} 行</span>
                        <span class="sql-editor__sep" />
                        <span>{{ charCount }} 字符</span>
                    </div>
                </div>

                <div class="sql-editor__body">
                    <div ref="gutterRef" class="sql-editor__gutter" aria-hidden="true">
                        <span v-for="n in lineCount" :key="n" class="sql-editor__ln">{{ n }}</span>
                    </div>
                    <textarea ref="textareaRef" v-model="sqlText" class="sql-editor__input" spellcheck="false"
                        autocomplete="off" autocorrect="off" autocapitalize="off"
                        placeholder="-- 在此编写 SQL&#10;SELECT * FROM your_table LIMIT 100;" @keydown="handleKeydown"
                        @scroll="syncGutter" />
                </div>
            </section>

            <!-- Splitter -->
            <div class="sql-splitter" role="separator" aria-orientation="horizontal" aria-label="调整编辑器高度"
                @mousedown="startResize">
                <span class="sql-splitter__grip" />
            </div>

            <!-- Results -->
            <section class="sql-result" :class="{ 'is-busy': loading }" :style="{ flex: `${100 - editorRatio} 1 0` }">
                <div class="sql-result__head">
                    <div class="sql-result__label">
                        <ArtSvgIcon icon="ri:table-2" />
                        <span>结果</span>
                    </div>

                    <Transition name="sql-fade">
                        <div v-if="result" class="sql-stats">
                            <span v-if="result.command" class="sql-stat">
                                <em>CMD</em>{{ result.command }}
                            </span>
                            <span class="sql-stat">
                                <em>ROWS</em>{{ result.rowCount }}
                            </span>
                            <span class="sql-stat"
                                :class="{ 'is-fast': result.durationMs < 50, 'is-slow': result.durationMs >= 500 }">
                                <em>TIME</em>{{ result.durationMs }}ms
                            </span>
                        </div>
                    </Transition>

                    <Transition name="sql-fade">
                        <div v-if="result?.truncated" class="sql-trunc">
                            <ArtSvgIcon icon="ri:scissors-cut-line" />
                            已截断至前 1000 行
                        </div>
                    </Transition>
                </div>

                <div class="sql-result__body">
                    <Transition name="sql-panel" mode="out-in">
                        <div v-if="loading" key="loading" class="sql-state sql-state--loading">
                            <div class="sql-loader">
                                <span /><span /><span />
                            </div>
                            <p>正在执行查询…</p>
                        </div>

                        <div v-else-if="tableColumns.length > 0" key="table" class="sql-grid-wrap">
                            <ElTable :data="result?.rows || []" border stripe height="100%" class="sql-grid"
                                empty-text="无数据行" :header-cell-style="headerCellStyle" :cell-style="cellStyle">
                                <ElTableColumn v-for="col in tableColumns" :key="col" :prop="col" :label="col"
                                    min-width="128" show-overflow-tooltip>
                                    <template #default="{ row }">
                                        <span :class="cellClass(row[col])">{{ formatCell(row[col]) }}</span>
                                    </template>
                                </ElTableColumn>
                            </ElTable>
                        </div>

                        <div v-else-if="executed" key="empty" class="sql-state">
                            <div class="sql-state__icon">
                                <ArtSvgIcon icon="ri:checkbox-circle-line" />
                            </div>
                            <h3>执行完成</h3>
                            <p>无结果集返回（非查询语句或空结果）</p>
                            <p v-if="result" class="sql-state__meta">
                                {{ result.command || 'OK' }} · {{ result.rowCount }} 行受影响 · {{ result.durationMs }}ms
                            </p>
                        </div>

                        <div v-else key="idle" class="sql-state sql-state--idle">
                            <div class="sql-state__glyph" aria-hidden="true">
                                <span /><span /><span />
                            </div>
                            <h3>等待执行</h3>
                            <p>编写 SQL 后按 <kbd class="sql-kbd sql-kbd--inline">{{ modKey }}</kbd> + <kbd
                                    class="sql-kbd sql-kbd--inline">Enter</kbd> 运行</p>
                        </div>
                    </Transition>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
import { fetchExecuteSql } from '@/api/dev/sql'

defineOptions({ name: 'DevSql' })

type RunState = 'idle' | 'running' | 'ok' | 'empty'

const pageRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const gutterRef = ref<HTMLElement | null>(null)

const sqlText = ref('SELECT 1 AS ok;')
const loading = ref(false)
const executed = ref(false)
const result = ref<Api.DevSql.ExecuteResult | null>(null)
const copied = ref(false)
const editorRatio = ref(42)

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform)
const modKey = isMac ? '⌘' : 'Ctrl'

const tableColumns = computed(() => result.value?.columns ?? [])
const lineCount = computed(() => Math.max(1, sqlText.value.split('\n').length))
const charCount = computed(() => sqlText.value.length)

const runState = computed<RunState>(() => {
    if (loading.value) return 'running'
    if (!executed.value) return 'idle'
    if (tableColumns.value.length > 0) return 'ok'
    return 'empty'
})

const statusLabel = computed(() => {
    switch (runState.value) {
        case 'running':
            return '执行中'
        case 'ok':
            return '有结果集'
        case 'empty':
            return '已完成'
        default:
            return '就绪'
    }
})

const headerCellStyle = {
    background: 'transparent',
    color: 'var(--sql-muted)',
    fontWeight: '600',
    fontSize: '12px',
    letterSpacing: '0.02em',
}

const cellStyle = {
    fontFamily: 'var(--sql-mono)',
    fontSize: '12.5px',
}

function formatCell(value: unknown): string {
    if (value === null || value === undefined) return 'NULL'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
}

function cellClass(value: unknown): string {
    if (value === null || value === undefined) return 'is-null'
    if (typeof value === 'number') return 'is-num'
    if (typeof value === 'boolean') return 'is-bool'
    return ''
}

function syncGutter() {
    if (!textareaRef.value || !gutterRef.value) return
    gutterRef.value.scrollTop = textareaRef.value.scrollTop
}

function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleExecute()
    }
    // Tab inserts spaces inside editor
    if (e.key === 'Tab') {
        e.preventDefault()
        const el = textareaRef.value
        if (!el) return
        const start = el.selectionStart
        const end = el.selectionEnd
        const next = `${sqlText.value.slice(0, start)}  ${sqlText.value.slice(end)}`
        sqlText.value = next
        nextTick(() => {
            el.selectionStart = el.selectionEnd = start + 2
        })
    }
}

async function handleExecute() {
    const sql = sqlText.value.trim()
    if (!sql) {
        ElMessage.warning('请输入 SQL')
        return
    }
    loading.value = true
    executed.value = true
    try {
        const data = await fetchExecuteSql({ sql })
        result.value = data
        ElMessage.success('执行成功')
    } catch {
        result.value = null
    } finally {
        loading.value = false
    }
}

function handleClear() {
    sqlText.value = ''
    result.value = null
    executed.value = false
    nextTick(() => textareaRef.value?.focus())
}

async function handleCopy() {
    try {
        await navigator.clipboard.writeText(sqlText.value)
        copied.value = true
        ElMessage.success('已复制 SQL')
        window.setTimeout(() => {
            copied.value = false
        }, 1600)
    } catch {
        ElMessage.error('复制失败')
    }
}

/** 拖拽调整编辑区高度比例 */
function startResize(e: MouseEvent) {
    e.preventDefault()
    const shell = pageRef.value?.querySelector('.sql-studio__shell') as HTMLElement | null
    if (!shell) return

    const onMove = (ev: MouseEvent) => {
        const rect = shell.getBoundingClientRect()
        const barH = 56
        const usable = rect.height - barH
        if (usable <= 0) return
        const y = ev.clientY - rect.top - barH
        const ratio = Math.round((y / usable) * 100)
        editorRatio.value = Math.min(72, Math.max(22, ratio))
    }

    const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.body.style.removeProperty('cursor')
        document.body.style.removeProperty('user-select')
    }

    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
}

onMounted(() => {
    nextTick(() => textareaRef.value?.focus())
})
</script>

<style scoped lang="scss">
.sql-studio {
    --sql-mono: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', ui-monospace, Menlo, Consolas, monospace;
    --sql-ink: #0f1218;
    --sql-ink-2: #161b24;
    --sql-ink-3: #1c2330;
    --sql-line: rgba(255, 255, 255, 0.06);
    --sql-text: #d7dde8;
    --sql-muted: #7d8aa3;
    --sql-accent: var(--el-color-primary);
    --sql-accent-soft: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --sql-warn: #c4923a;
    --sql-surface: var(--default-box-color);
    --sql-border: var(--art-card-border);
    --sql-fg: var(--art-gray-900);
    --sql-fg-muted: var(--art-gray-600);
    --sql-radius: 14px;

    display: flex;
    flex-direction: column;
    min-height: 0;
    color: var(--sql-fg);
}

.sql-studio__shell {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    border: 1px solid var(--sql-border);
    border-radius: var(--sql-radius);
    background: var(--sql-surface);
    box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.4) inset,
        0 18px 40px -28px rgba(15, 18, 24, 0.35);
}

html.dark .sql-studio__shell {
    box-shadow: 0 18px 40px -28px rgba(0, 0, 0, 0.65);
}

/* ── Top bar ── */
.sql-bar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 56px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--sql-border);
    background: color-mix(in srgb, var(--sql-surface) 92%, var(--art-gray-200));
}

.sql-bar__brand {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.sql-bar__mark {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: var(--sql-accent);
    box-shadow: 0 0 0 4px var(--sql-accent-soft);
}

.sql-bar__titles {
    min-width: 0;
}

.sql-bar__title {
    margin: 0;
    font-size: 14px;
    font-weight: 650;
    letter-spacing: -0.01em;
    line-height: 1.2;
}

.sql-bar__sub {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--sql-fg-muted);
    line-height: 1.2;
}

.sql-bar__status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-left: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--sql-border);
    background: color-mix(in srgb, var(--sql-surface) 70%, transparent);
    font-size: 12px;
    color: var(--sql-fg-muted);
}

.sql-bar__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--sql-fg-muted);
}

.sql-bar__status.is-running .sql-bar__dot {
    background: var(--sql-warn);
    animation: sql-pulse 1s ease-in-out infinite;
}

.sql-bar__status.is-ok .sql-bar__dot {
    background: var(--sql-accent);
}

.sql-bar__status.is-empty .sql-bar__dot {
    background: #5b8def;
}

.sql-bar__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.sql-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border: 1px solid var(--sql-border);
    border-radius: 8px;
    background: var(--sql-surface);
    color: var(--sql-fg);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition:
        background 0.18s ease,
        border-color 0.18s ease,
        transform 0.18s ease,
        opacity 0.18s ease;
}

.sql-btn:hover:not(:disabled) {
    background: var(--art-hover-color);
}

.sql-btn:active:not(:disabled) {
    transform: translateY(1px);
}

.sql-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.sql-btn--ghost {
    color: var(--sql-fg-muted);
}

.sql-btn--run {
    overflow: hidden;
    border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent);
    background: var(--el-color-primary);
    color: var(--el-color-white);
    box-shadow:
        0 1px 0 color-mix(in srgb, #fff 22%, transparent) inset,
        0 8px 18px -10px color-mix(in srgb, var(--el-color-primary) 70%, transparent);
}

.sql-btn--run:hover:not(:disabled) {
    background: var(--el-color-primary-light-3);
}

.sql-btn--run.is-loading {
    pointer-events: none;
}

.sql-btn__glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.22) 48%, transparent 66%);
    transform: translateX(-120%);
    animation: sql-shine 2.8s ease-in-out infinite;
}

.sql-kbd {
    display: inline-flex;
    align-items: center;
    height: 18px;
    padding: 0 5px;
    margin-left: 2px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(0, 0, 0, 0.16);
    font-family: var(--sql-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.88);
}

.sql-kbd--inline {
    height: 20px;
    border-color: var(--sql-border);
    background: color-mix(in srgb, var(--art-gray-200) 80%, transparent);
    color: var(--sql-fg-muted);
}

.is-spin {
    animation: sql-spin 0.8s linear infinite;
}

/* ── Editor ── */
.sql-editor {
    display: flex;
    flex-direction: column;
    min-height: 140px;
    overflow: hidden;
    background: var(--sql-ink);
    color: var(--sql-text);
}

.sql-editor__chrome {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 12px;
    height: 36px;
    border-bottom: 1px solid var(--sql-line);
    background: var(--sql-ink-2);
}

.sql-editor__tabs {
    display: flex;
    align-items: center;
    min-width: 0;
}

.sql-editor__tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 10px;
    border-bottom: 2px solid transparent;
    font-family: var(--sql-mono);
    font-size: 12px;
    color: var(--sql-muted);
}

.sql-editor__tab.is-active {
    color: var(--sql-text);
    border-bottom-color: var(--sql-accent);
}

.sql-editor__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--sql-mono);
    font-size: 11px;
    color: var(--sql-muted);
}

.sql-editor__sep {
    width: 1px;
    height: 10px;
    background: var(--sql-line);
}

.sql-editor__body {
    flex: 1;
    display: grid;
    grid-template-columns: 48px 1fr;
    min-height: 0;
    overflow: hidden;
}

.sql-editor__gutter {
    overflow: hidden;
    padding: 14px 0;
    border-right: 1px solid var(--sql-line);
    background: color-mix(in srgb, var(--sql-ink-2) 88%, #000);
    text-align: right;
    font-family: var(--sql-mono);
    font-size: 12.5px;
    line-height: 1.65;
    color: #4d5a73;
    user-select: none;
}

.sql-editor__ln {
    display: block;
    padding-right: 10px;
}

.sql-editor__input {
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 14px 16px;
    border: 0;
    outline: none;
    resize: none;
    background: transparent;
    color: var(--sql-text);
    caret-color: var(--el-color-primary);
    font-family: var(--sql-mono);
    font-size: 13px;
    line-height: 1.65;
    tab-size: 2;
}

.sql-editor__input::placeholder {
    color: #4d5a73;
}

.sql-editor__input:focus {
    outline: none;
}

/* ── Splitter ── */
.sql-splitter {
    flex: 0 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: row-resize;
    background: color-mix(in srgb, var(--sql-surface) 70%, var(--art-gray-200));
    border-top: 1px solid var(--sql-border);
    border-bottom: 1px solid var(--sql-border);
    transition: background 0.15s ease;
}

.sql-splitter:hover,
.sql-splitter:active {
    background: color-mix(in srgb, var(--sql-accent-soft) 55%, var(--sql-surface));
}

.sql-splitter__grip {
    width: 36px;
    height: 3px;
    border-radius: 99px;
    background: color-mix(in srgb, var(--sql-fg-muted) 45%, transparent);
}

/* ── Result ── */
.sql-result {
    display: flex;
    flex-direction: column;
    min-height: 160px;
    overflow: hidden;
    background: var(--sql-surface);
}

.sql-result.is-busy .sql-result__body {
    opacity: 0.92;
}

.sql-result__head {
    flex: 0 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 14px;
    min-height: 42px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--sql-border);
}

.sql-result__label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--sql-fg);
}

.sql-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.sql-stat {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid var(--sql-border);
    background: color-mix(in srgb, var(--art-gray-100) 75%, transparent);
    font-family: var(--sql-mono);
    font-size: 12px;
    color: var(--sql-fg);
}

.sql-stat em {
    font-style: normal;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--sql-fg-muted);
}

.sql-stat.is-fast {
    border-color: color-mix(in srgb, var(--sql-accent) 35%, transparent);
    color: color-mix(in srgb, var(--sql-accent) 80%, var(--sql-fg));
}

.sql-stat.is-slow {
    border-color: color-mix(in srgb, var(--sql-warn) 40%, transparent);
    color: color-mix(in srgb, var(--sql-warn) 85%, var(--sql-fg));
}

.sql-trunc {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-left: auto;
    font-size: 12px;
    color: var(--sql-warn);
}

.sql-result__body {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.sql-grid-wrap {
    height: 100%;
    min-height: 0;
}

.sql-grid {
    height: 100%;

    :deep(.el-table) {
        --el-table-border-color: var(--sql-border);
        --el-table-header-bg-color: color-mix(in srgb, var(--art-gray-100) 88%, transparent);
        --el-table-row-hover-bg-color: color-mix(in srgb, var(--sql-accent-soft) 35%, transparent);
        background: transparent;
    }

    :deep(.el-table__inner-wrapper::before) {
        display: none;
    }

    :deep(.el-table th.el-table__cell) {
        border-bottom-color: var(--sql-border);
    }

    :deep(.is-null) {
        color: var(--sql-fg-muted);
        font-style: italic;
        opacity: 0.72;
    }

    :deep(.is-num) {
        color: var(--el-color-primary);
        font-variant-numeric: tabular-nums;
    }

    :deep(.is-bool) {
        color: var(--el-color-primary-light-3);
    }
}

.sql-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 180px;
    padding: 24px;
    text-align: center;
    color: var(--sql-fg-muted);

    h3 {
        margin: 12px 0 6px;
        font-size: 15px;
        font-weight: 600;
        color: var(--sql-fg);
    }

    p {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
    }
}

.sql-state__icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--sql-accent-soft);
    color: var(--sql-accent);
    font-size: 22px;
}

.sql-state__meta {
    margin-top: 10px !important;
    font-family: var(--sql-mono);
    font-size: 12px !important;
}

.sql-state__glyph {
    display: flex;
    gap: 5px;

    span {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        background: color-mix(in srgb, var(--sql-fg-muted) 35%, transparent);
    }

    span:nth-child(2) {
        height: 14px;
        align-self: flex-end;
        background: color-mix(in srgb, var(--sql-accent) 55%, transparent);
    }
}

.sql-loader {
    display: flex;
    gap: 6px;

    span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--sql-accent);
        animation: sql-bounce 0.9s ease-in-out infinite;
    }

    span:nth-child(2) {
        animation-delay: 0.12s;
    }

    span:nth-child(3) {
        animation-delay: 0.24s;
    }
}

.sql-state--loading p {
    margin-top: 14px;
}

/* ── Transitions ── */
.sql-fade-enter-active,
.sql-fade-leave-active {
    transition: opacity 0.22s ease, transform 0.22s ease;
}

.sql-fade-enter-from,
.sql-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.sql-panel-enter-active,
.sql-panel-leave-active {
    transition: opacity 0.24s ease, transform 0.24s ease;
}

.sql-panel-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.sql-panel-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

@keyframes sql-pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.45;
        transform: scale(0.85);
    }
}

@keyframes sql-spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes sql-shine {

    0%,
    55% {
        transform: translateX(-120%);
    }

    75%,
    100% {
        transform: translateX(120%);
    }
}

@keyframes sql-bounce {

    0%,
    80%,
    100% {
        transform: translateY(0);
        opacity: 0.45;
    }

    40% {
        transform: translateY(-6px);
        opacity: 1;
    }
}

@media (max-width: 760px) {
    .sql-bar {
        flex-wrap: wrap;
    }

    .sql-bar__status {
        order: 3;
        margin-left: 22px;
    }

    .sql-bar__actions {
        width: 100%;
        justify-content: flex-end;
    }

    .sql-btn span:not(.sql-btn__glow) {
        display: none;
    }

    .sql-btn--run span:not(.sql-btn__glow) {
        display: inline;
    }

    .sql-btn--run .sql-kbd {
        display: none;
    }
}

@media (prefers-reduced-motion: reduce) {

    .sql-btn__glow,
    .is-spin,
    .sql-bar__status.is-running .sql-bar__dot,
    .sql-loader span {
        animation: none !important;
    }

    .sql-fade-enter-active,
    .sql-fade-leave-active,
    .sql-panel-enter-active,
    .sql-panel-leave-active {
        transition: none !important;
    }
}
</style>
