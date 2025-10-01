"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Hammer, Home } from 'lucide-react';
import Link from 'next/link';
import { FormEngineProvider, DynamicFormRenderer } from '@/lib/form-engine/renderer';
import { DynamicFormNavigation } from '@/components/form/DynamicFormNavigation';
import {
  FormTemplateWithSections,
  FormResponse,
  RepeatableGroupData,
  CalculatedScores,
} from '@/lib/form-engine/types';
import { submitFormResponse, saveDraftResponse, loadDraftResponse } from './actions';
import { toast } from 'sonner';

function DynamicFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const draftId = searchParams?.get('draft');

  const [template, setTemplate] = useState<FormTemplateWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId);
const [initialFormData, setInitialFormData] = useState<{
  responses: FormResponse;
  repeatGroups: RepeatableGroupData;
  calculatedScores: Record<string, unknown>;
} | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  useEffect(() => {
    async function loadTemplateAndDraft() {
      try {
        // Always load the template first
        const response = await fetch('/api/form-templates');
        if (!response.ok) {
          throw new Error('Failed to load form template');
        }
        const templateData = await response.json();
        setTemplate(templateData);

        // If we have a draft ID, load the draft data
        if (draftId) {
          console.log('🔍 Loading draft:', draftId);
          const draftResult = await loadDraftResponse(draftId);

          if (draftResult.success && draftResult.data) {
            console.log('✅ Draft loaded successfully:', draftResult.data);
            setInitialFormData({
              responses: draftResult.data.responses,
              repeatGroups: draftResult.data.repeatGroups,
              calculatedScores: draftResult.data.calculatedScores,
            });
            setCurrentDraftId(draftResult.submissionId || draftId);
            setIsDraftLoaded(true);
            toast.success('Draft loaded successfully!');
          } else {
            console.error('❌ Failed to load draft:', draftResult.error);
            toast.error(draftResult.error || 'Failed to load draft');
            // Remove the draft parameter from URL if loading failed
            router.replace('/dynamic-form');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadTemplateAndDraft();
  }, [draftId, router]);

  const handleSubmit = async (data: {
    responses: FormResponse;
    repeatGroups: RepeatableGroupData;
    calculatedScores: CalculatedScores | null;
  }) => {
    console.log('Form submitted:', data);

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      if (!template?.id) {
        toast.error('No form template found');
        setIsSubmitting(false);
        return;
      }

      const normalizedScores: Record<string, unknown> = data.calculatedScores
        ? { ...data.calculatedScores }
        : {};

      const result = await submitFormResponse({
        templateId: template.id,
        responses: data.responses as Record<string, unknown>,
        repeatGroups: data.repeatGroups as Record<string, unknown>,
        calculatedScores: normalizedScores,
      });

      if (result.success) {
        console.log('✅ Form submitted successfully:', result.submissionId);
        toast.success('Form submitted successfully!');

        // Clear the current draft ID since it's now submitted
        setCurrentDraftId(null);
        setInitialFormData(null);
        setIsDraftLoaded(false);

        // Redirect to drafts page with success message
        setTimeout(() => {
          router.push('/dynamic-form/drafts?submitted=true');
        }, 1500);
      } else {
        console.error('❌ Form submission failed:', result.error);
        toast.error(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      toast.error('An unexpected error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (data: {
    responses: FormResponse;
    repeatGroups: RepeatableGroupData;
    calculatedScores: CalculatedScores | null;
  }) => {
    console.log('Draft saved:', data);

    if (isSavingDraft) return; // Prevent multiple save operations

    setIsSavingDraft(true);
    try {
      if (!template?.id) {
        toast.error('No form template found');
        setIsSavingDraft(false);
        return;
      }

      const normalizedScores: Record<string, unknown> = data.calculatedScores
        ? { ...data.calculatedScores }
        : {};

      const result = await saveDraftResponse(
        {
          templateId: template.id,
          responses: data.responses as Record<string, unknown>,
          repeatGroups: data.repeatGroups as Record<string, unknown>,
          calculatedScores: normalizedScores,
        },
        'anonymous', // TODO: Replace with actual user ID when auth is implemented
        currentDraftId || undefined
      );

      if (result.success) {
        console.log('✅ Draft saved successfully:', result.submissionId);

        // Update current draft ID if this was a new draft
        if (!currentDraftId && result.submissionId) {
          setCurrentDraftId(result.submissionId);
          // Update URL to include draft ID for future saves
          router.replace(`/dynamic-form?draft=${result.submissionId}`, { scroll: false });
        }

        toast.success(currentDraftId ? 'Draft updated successfully!' : 'Draft saved successfully!');
      } else {
        console.error('❌ Draft save failed:', result.error);
        toast.error(result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('❌ Draft save error:', error);
      toast.error('An unexpected error occurred while saving draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {draftId ? 'Loading draft...' : 'Loading dynamic form...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Form</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/">
              <Button variant="outline">Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Form Template Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">No active form template was found in the database.</p>
            <Link href="/">
              <Button variant="outline">Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-primary font-bold text-xl">✚</div>
              <span className="font-semibold text-lg">Technology Triage (Dynamic)</span>
            </Link>
            <div className="flex items-center space-x-4">
              {currentDraftId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Draft Mode
                </Badge>
              )}
              <Link href="/dynamic-form/drafts">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  My Drafts
                </Button>
              </Link>
              <Link href="/dynamic-form/builder">
                <Button variant="ghost" size="sm">
                  <Hammer className="mr-2 h-4 w-4" />
                  Builder
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{template.name}</h1>
              <p className="text-gray-600">{template.description}</p>
              <p className="text-sm text-gray-500">Version: {template.version}</p>
            </div>
            {isDraftLoaded && (
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  Draft Loaded
                </Badge>
                <p className="text-sm text-gray-500">
                  Continuing previous work
                </p>
              </div>
            )}
          </div>
        </div>

        <FormEngineProvider
          template={template}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          initialData={initialFormData ? {
            responses: initialFormData.responses,
            repeatGroups: initialFormData.repeatGroups,
          } : undefined}
        >
          <div className="space-y-8">
            <DynamicFormRenderer />

            {/* Dynamic Navigation */}
            <DynamicFormNavigation
              onSubmit={(formData) =>
                handleSubmit({
                  responses: formData.responses as FormResponse,
                  repeatGroups: formData.repeatGroups as RepeatableGroupData,
                  calculatedScores: null,
                })
              }
              onSaveDraft={(formData) =>
                handleSaveDraft({
                  responses: formData.responses as FormResponse,
                  repeatGroups: formData.repeatGroups as RepeatableGroupData,
                  calculatedScores: null,
                })
              }
              isSubmitting={isSubmitting}
              isSavingDraft={isSavingDraft}
            />
          </div>
        </FormEngineProvider>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading form...</p>
      </div>
    </div>
  );
}

export default function DynamicFormPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DynamicFormContent />
    </Suspense>
  );
}
