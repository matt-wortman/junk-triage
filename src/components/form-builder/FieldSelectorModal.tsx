"use client"

import { useState } from 'react'
import { FieldType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFieldTypesByCategory, FIELD_TYPE_CONFIG, FIELD_CATEGORY_LABELS } from '@/lib/form-builder/field-type-config'
import { FieldTypeIcon } from './FieldTypeIcon'
import { cn } from '@/lib/utils'

interface FieldSelectorModalProps {
  triggerLabel?: string
  onSelect: (fieldType: FieldType) => void
  disabled?: boolean
}

export function FieldSelectorModal({ triggerLabel = 'Add field', onSelect, disabled = false }: FieldSelectorModalProps) {
  const [open, setOpen] = useState(false)
  const categories = getFieldTypesByCategory()
  const firstCategory = categories[0]?.category

  const handleSelect = (type: FieldType) => {
    onSelect(type)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select a field type</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={firstCategory ?? ''} className="mt-4">
          <TabsList className="grid grid-cols-3">
            {categories.map(({ category, label }) => (
              <TabsTrigger key={category} value={category}>
                {FIELD_CATEGORY_LABELS[category] ?? label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(({ category, types }) => (
            <TabsContent key={category} value={category} className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {types.map((type) => {
                  const config = FIELD_TYPE_CONFIG[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      className={cn(
                        'rounded-lg border bg-muted/20 p-4 text-left transition-colors hover:border-primary hover:bg-primary/10'
                      )}
                      onClick={() => handleSelect(type)}
                    >
                      <FieldTypeIcon type={type} size="md" />
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold text-foreground">{config.label}</p>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
