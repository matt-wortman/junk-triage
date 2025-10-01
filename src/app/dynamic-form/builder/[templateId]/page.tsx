import { notFound } from 'next/navigation'
import { getTemplateDetail } from '../actions'
import { PreviewMode } from '@/components/form-builder/PreviewMode'

export const dynamic = 'force-dynamic'

interface BuilderEditorPageProps {
  params: {
    templateId: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function BuilderEditorPage({ params, searchParams }: BuilderEditorPageProps) {
  const template = await getTemplateDetail(params.templateId)

  if (!template) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <PreviewMode initialTemplate={template} searchParams={searchParams} />
      </div>
    </div>
  )
}
