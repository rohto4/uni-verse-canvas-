import { vi } from 'vitest'

type QueryResponse = Record<string, unknown>

const chainMethods = [
  'select',
  'insert',
  'update',
  'delete',
  'upsert',
  'eq',
  'neq',
  'in',
  'or',
  'order',
  'range',
  'single',
  'limit',
]

export function createQueryMock(responses: QueryResponse[] = []) {
  const queue = [...responses]

  const query: Record<string, unknown> = {
    then: (resolve: (value: unknown) => void, reject: (reason?: unknown) => void) =>
      Promise.resolve(queue.shift() ?? {}).then(resolve, reject),
  }

  chainMethods.forEach((method) => {
    query[method] = vi.fn(() => query)
  })

  return query
}

type TableResponses = Record<string, Array<QueryResponse | QueryResponse[]>>

export function createSupabaseMock(tableResponses: Record<string, TableResponses> = {}) {
  const from = vi.fn((table: string) => {
    const responsesForTable = tableResponses[table] || {}
    const tableMock: Record<string, unknown> = {}

    const ops = ['select', 'insert', 'update', 'delete', 'upsert']
    ops.forEach((op) => {
      tableMock[op] = vi.fn(() => {
        const queue = responsesForTable[op] || []
        const next = queue.shift()
        const responses = Array.isArray(next) ? next : next ? [next] : [{}]
        return createQueryMock(responses)
      })
    })

    return tableMock
  })

  return { from }
}
