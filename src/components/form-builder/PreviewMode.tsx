"use client"

import { useMemo, useState } from 'react'
import { TemplateDetail } from '@/app/dynamic-form/builder/actions'
import { BuilderLayout } from './BuilderLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormEngineProvider, DynamicFormRenderer } from '@/lib/form-engine/renderer'
import { DynamicFormNavigation } from '@/components/form/DynamicFormNavigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface PreviewModeProps {
  initialTemplate: TemplateDetail
  searchParams?: Record<string, string | string[] | undefined>
}

export function PreviewMode({ initialTemplate, searchParams }: PreviewModeProps) {
  const [preview, setPreview] = useState(searchParams?.mode === 'preview')

  const template = useMemo(() => initialTemplate, [initialTemplate])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant={preview ? 'outline' : 'default'} onClick={() => setPreview(false)}>
            Edit Mode
          </Button>
          <Button variant={preview ? 'default' : 'outline'} onClick={() => setPreview(true)}>
            Preview Mode
          </Button>
          {preview && <Badge variant="secondary">Previewing</Badge>}
        </div>
      </div>

      {preview ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-white p-6 space-y-6">
              <FormEngineProvider
                template={template}
                onSubmit={async () => toast.info('Preview submit intercepted')}
                onSaveDraft={async () => toast.info('Preview save intercepted')}
              >
                <DynamicFormRenderer />
                <DynamicFormNavigation
                  onSubmit={async () => toast.info('Preview submit intercepted')}
                  onSaveDraft={async () => toast.info('Preview save intercepted')}
                />
              </FormEngineProvider>
            </div>
          </CardContent>
        </Card>
      ) : (
        <BuilderLayout template={template} />
      )}
    </div>
  )
}
