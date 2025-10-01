"use client"

import { FieldType } from '@prisma/client'
import { FIELD_TYPE_CONFIG } from '@/lib/form-builder/field-type-config'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const ICON_SIZES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

const WRAPPER_SIZES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
}

interface FieldTypeIconProps {
  type: FieldType
  size?: 'sm' | 'md' | 'lg'
  withLabel?: boolean
}

export function FieldTypeIcon({ type, size = 'md', withLabel = false }: FieldTypeIconProps) {
  const config = FIELD_TYPE_CONFIG[type]

  if (!config) return null

  const Icon = config.icon
  const iconElement = (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground transition-colors',
        WRAPPER_SIZES[size]
      )}
    >
      <Icon className={cn(ICON_SIZES[size])} />
    </span>
  )

  const trigger = withLabel ? (
    <span className="inline-flex items-center gap-2">
      {iconElement}
      <span className="text-sm font-medium text-muted-foreground">{config.label}</span>
    </span>
  ) : (
    iconElement
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
