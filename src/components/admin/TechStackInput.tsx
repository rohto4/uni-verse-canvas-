'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TechStackInputProps {
  value: Record<string, number>
  onChange: (value: Record<string, number>) => void
}

interface TechEntry {
  id: string
  language: string
  percentage: string
}

export function TechStackInput({ value, onChange }: TechStackInputProps) {
  const [entries, setEntries] = useState<TechEntry[]>([])

  useEffect(() => {
    if (Object.keys(value).length > 0) {
      const initialEntries = Object.entries(value).map(([lang, percent]) => ({
        id: Math.random().toString(36).substr(2, 9),
        language: lang,
        percentage: percent.toString(),
      }))
      setEntries(initialEntries)
    } else {
      setEntries([])
    }
  }, [value])

  const addEntry = () => {
    setEntries([
      ...entries,
      { id: Math.random().toString(36).substr(2, 9), language: '', percentage: '' },
    ])
  }

  const removeEntry = (id: string) => {
    const newEntries = entries.filter((e) => e.id !== id)
    setEntries(newEntries)
    updateValue(newEntries)
  }

  const updateEntry = (id: string, field: 'language' | 'percentage', newValue: string) => {
    const newEntries = entries.map((e) =>
      e.id === id ? { ...e, [field]: newValue } : e
    )
    setEntries(newEntries)
    updateValue(newEntries)
  }

  const updateValue = (currentEntries: TechEntry[]) => {
    const newValue: Record<string, number> = {}
    currentEntries.forEach((entry) => {
      if (entry.language && entry.percentage) {
        const percentage = parseFloat(entry.percentage)
        if (!isNaN(percentage)) {
          newValue[entry.language] = percentage
        }
      }
    })
    onChange(newValue)
  }

  const total = entries.reduce((sum, entry) => {
    const percentage = parseFloat(entry.percentage)
    return sum + (isNaN(percentage) ? 0 : percentage)
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>技術スタック・言語使用率</Label>
        <Button type="button" variant="outline" size="sm" onClick={addEntry}>
          <Plus className="h-4 w-4 mr-1" />
          追加
        </Button>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-2 items-center">
            <Input
              placeholder="言語名（例: TypeScript）"
              value={entry.language}
              onChange={(e) => updateEntry(entry.id, 'language', e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="0.0"
                min="0"
                max="100"
                step="0.1"
                value={entry.percentage}
                onChange={(e) => updateEntry(entry.id, 'percentage', e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeEntry(entry.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
            技術スタックを追加してください
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">合計:</span>
          <span className={`font-semibold ${total > 100 ? 'text-destructive' : 'text-foreground'}`}>
            {total.toFixed(1)}%
          </span>
        </div>
      )}

      {total > 100 && (
        <p className="text-sm text-destructive">合計が100%を超えています</p>
      )}
    </div>
  )
}
