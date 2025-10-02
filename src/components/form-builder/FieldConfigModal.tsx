"use client"

import { useEffect, useMemo, useState, useTransition } from 'react'
import { FieldType } from '@prisma/client'
import { TemplateDetail, updateField, FieldUpdateInput } from '@/app/dynamic-form/builder/actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldTypeIcon } from './FieldTypeIcon'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface FieldConfigModalProps {
  field: TemplateDetail['sections'][number]['questions'][number]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

interface OptionState {
  id?: string
  label: string
  value: string
  key: string
}

const selectionTypes = new Set<FieldType>([
  FieldType.SINGLE_SELECT,
  FieldType.CHECKBOX_GROUP,
  FieldType.MULTI_SELECT,
])

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const newOption = (): OptionState => ({
  key: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
  label: '',
  value: '',
})

export function FieldConfigModal({ field, open, onOpenChange, onSaved }: FieldConfigModalProps) {
  const [labelValue, setLabelValue] = useState(field.label)
  const [helpTextValue, setHelpTextValue] = useState(field.helpText ?? '')
  const [placeholderValue, setPlaceholderValue] = useState(field.placeholder ?? '')
  const [isRequired, setIsRequired] = useState(field.isRequired)
  const [options, setOptions] = useState<OptionState[]>([])
  const [pending, startTransition] = useTransition()

  const supportsOptions = useMemo(() => selectionTypes.has(field.type), [field.type])

  useEffect(() => {
    if (!open) return

    setLabelValue(field.label)
    setHelpTextValue(field.helpText ?? '')
    setPlaceholderValue(field.placeholder ?? '')
    setIsRequired(field.isRequired)

    if (supportsOptions) {
      const nextOptions = field.options.length > 0
        ? field.options
            .sort((a, b) => a.order - b.order)
            .map((option) => ({
              id: option.id,
              label: option.label,
              value: option.value,
              key: option.id,
            }))
        : [newOption()]
      setOptions(nextOptions)
    } else {
      setOptions([])
    }
  }, [field, open, supportsOptions])

  const handleOptionChange = (index: number, key: keyof OptionState, value: string) => {
    setOptions((prev) => {
      const next = [...prev]
      const item = { ...next[index] }

      if (key === 'label') {
        const prevLabel = item.label
        item.label = value
        if (!item.value || item.value === slugify(prevLabel)) {
          item.value = slugify(value)
        }
      } else {
        item[key] = value
      }

      next[index] = item
      return next
    })
  }

  const handleAddOption = () => {
    setOptions((prev) => [...prev, newOption()])
  }

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSave = () => {
    if (!labelValue.trim()) {
      toast.error('Field label is required')
      return
    }

    let optionPayload: FieldUpdateInput['options'] | undefined
    if (supportsOptions) {
      const cleanedOptions = options
        .map((option) => ({
          id: option.id,
          label: option.label.trim(),
          value: (option.value || slugify(option.label)).trim(),
        }))
        .filter((option) => option.label.length > 0)

      if (cleanedOptions.length === 0) {
        toast.error('Add at least one option for this field')
        return
      }

      optionPayload = cleanedOptions
    }

    startTransition(async () => {
      try {
        const result = await updateField(field.id, {
          label: labelValue.trim(),
          helpText: helpTextValue.trim() || undefined,
          placeholder: placeholderValue.trim() || undefined,
          isRequired,
          options: optionPayload,
        })
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('Field updated')
        onSaved()
      } catch (error) {
        console.error('Failed to update field', error)
        toast.error('Unable to update field')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configure field</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
            <FieldTypeIcon type={field.type} size="md" />
            <div>
              <p className="text-sm font-semibold text-foreground">{labelValue || field.label}</p>
              <p className="text-xs text-muted-foreground capitalize">{field.type.replace(/_/g, ' ').toLowerCase()}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor={`field-label-${field.id}`}>Label</Label>
              <Input
                id={`field-label-${field.id}`}
                value={labelValue}
                onChange={(event) => setLabelValue(event.target.value)}
                placeholder="Field label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-help-${field.id}`}>Help text</Label>
              <Textarea
                id={`field-help-${field.id}`}
                value={helpTextValue}
                onChange={(event) => setHelpTextValue(event.target.value)}
                placeholder="Optional guidance for end users"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-placeholder-${field.id}`}>Placeholder</Label>
              <Input
                id={`field-placeholder-${field.id}`}
                value={placeholderValue}
                onChange={(event) => setPlaceholderValue(event.target.value)}
                placeholder="Placeholder text"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch id={`field-required-${field.id}`} checked={isRequired} onCheckedChange={setIsRequired} />
              <Label htmlFor={`field-required-${field.id}`}>Required</Label>
            </div>
          </div>

          {supportsOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Options</h3>
                <Button variant="outline" size="sm" onClick={handleAddOption}>
                  Add option
                </Button>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.key} className="flex flex-wrap items-center gap-2">
                    <Input
                      className="flex-1"
                      placeholder={`Option ${index + 1} label`}
                      value={option.label}
                      onChange={(event) => handleOptionChange(index, 'label', event.target.value)}
                    />
                    <Input
                      className="flex-1"
                      placeholder="Value"
                      value={option.value}
                      onChange={(event) => handleOptionChange(index, 'value', event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                      disabled={options.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {options.length === 0 && (
                  <p className="text-xs text-muted-foreground">No options yet. Add at least one before saving.</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={pending}>
              {pending ? 'Saving…' : 'Save field'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
