"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FormEngineProvider, DynamicFormRenderer } from '@/lib/form-engine/renderer';
import { DynamicFormNavigation } from '@/components/form/DynamicFormNavigation';
import { FormTemplateWithSections } from '@/lib/form-engine/types';

export default function DynamicFormPage() {
  const [template, setTemplate] = useState<FormTemplateWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const response = await fetch('/api/form-templates');
        if (!response.ok) {
          throw new Error('Failed to load form template');
        }
        const data = await response.json();
        setTemplate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadTemplate();
  }, []);

  const handleSubmit = async (data: { responses: Record<string, unknown>; repeatGroups: Record<string, unknown>; calculatedScores: unknown }) => {
    console.log('Form submitted:', data);

    try {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template?.id,
          submittedBy: 'current_user', // TODO: Get from auth
          status: 'SUBMITTED',
          responses: data.responses,
          repeatGroups: data.repeatGroups,
          calculatedScores: data.calculatedScores,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Form submitted successfully:', result.submissionId);
        // TODO: Show success message and redirect
      } else {
        console.error('❌ Form submission failed:', result.error);
        // TODO: Show error message
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      // TODO: Show error message
    }
  };

  const handleSaveDraft = async (data: { responses: Record<string, unknown>; repeatGroups: Record<string, unknown>; calculatedScores: unknown }) => {
    console.log('Draft saved:', data);

    try {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template?.id,
          submittedBy: 'current_user', // TODO: Get from auth
          status: 'DRAFT',
          responses: data.responses,
          repeatGroups: data.repeatGroups,
          calculatedScores: data.calculatedScores,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Draft saved successfully:', result.submissionId);
        // TODO: Show success message
      } else {
        console.error('❌ Draft save failed:', result.error);
        // TODO: Show error message
      }
    } catch (error) {
      console.error('❌ Draft save error:', error);
      // TODO: Show error message
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dynamic form...</p>
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
              <span className="text-sm text-muted-foreground">
                Dynamic Form Engine
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <p className="text-gray-600">{template.description}</p>
          <p className="text-sm text-gray-500">Version: {template.version}</p>
        </div>

        <FormEngineProvider
          template={template}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
        >
          <Card className="mb-8">
            <CardContent className="p-6">
              <DynamicFormRenderer />
            </CardContent>
          </Card>

          {/* Dynamic Navigation */}
          <DynamicFormNavigation />
        </FormEngineProvider>
      </div>
    </div>
  );
}