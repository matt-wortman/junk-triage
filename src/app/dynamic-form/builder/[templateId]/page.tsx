import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FileText, Hammer, ArrowLeft } from 'lucide-react'
import { getTemplateDetail } from '../actions'
import { PreviewMode } from '@/components/form-builder/PreviewMode'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface BuilderEditorPageProps {
  params: Promise<{
    templateId: string
  }> | {
    templateId: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function BuilderEditorPage({ params, searchParams }: BuilderEditorPageProps) {
  const resolvedParams = await params
  const template = await getTemplateDetail(resolvedParams.templateId)

  if (!template) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-foreground">
            <span className="text-primary text-xl">✚</span>
            <span>Technology Triage Builder</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dynamic-form" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Dynamic Form
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dynamic-form/builder" className="flex items-center gap-2">
                <Hammer className="h-4 w-4" />
                All Templates
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dynamic-form/builder" className="hover:text-foreground">
              Templates
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="truncate font-medium text-foreground" title={template.name}>
              {template.name}
            </span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dynamic-form/builder" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to templates
            </Link>
          </Button>
        </div>

        <PreviewMode initialTemplate={template} searchParams={searchParams} />
      </div>
    </div>
  )
}
