declare namespace Api {
    namespace DevSql {
        interface ExecuteParams {
            sql: string
        }

        interface ExecuteResult {
            columns: string[]
            rows: Record<string, unknown>[]
            rowCount: number
            command?: string | null
            durationMs: number
            truncated?: boolean
        }
    }
}