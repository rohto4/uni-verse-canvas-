import { describe, it, expect } from 'vitest'
import { normalizeTagIds } from '@/lib/actions/projects'

describe('normalizeTagIds', () => {
  it('deduplicates tag ids and keeps order', () => {
    expect(normalizeTagIds(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('filters empty values', () => {
    expect(normalizeTagIds(['a', '', 'b'])).toEqual(['a', 'b'])
  })

  it('returns empty array for undefined', () => {
    expect(normalizeTagIds(undefined)).toEqual([])
  })
})
