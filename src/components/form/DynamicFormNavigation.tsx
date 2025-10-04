import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Download, Save, Send } from 'lucide-react';
import { useFormEngine } from '@/lib/form-engine/renderer';
import { shouldShowField, shouldRequireField, parseConditionalConfig } from '@/lib/form-engine/conditional-logic';
import { ValidationRule } from '@/lib/form-engine/types';
import { parseValidationMetadata } from '@/lib/form-engine/json-utils';
import { toast } from 'sonner';

type SubmissionStatusValue = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'ARCHIVED';

interface DynamicFormNavigationProps {
  onSaveDraft?: (data: { responses: Record<string, unknown>; repeatGroups: Record<string, unknown>; calculatedScores: unknown }) => void;
  onSubmit?: (data: { responses: Record<string, unknown>; repeatGroups: Record<string, unknown>; calculatedScores: unknown }) => void;
  isSubmitting?: boolean;
  isSavingDraft?: boolean;
  submissionId?: string | null;
  exportStatus?: SubmissionStatusValue | 'BLANK' | 'IN_PROGRESS';
}

export function DynamicFormNavigation({
  onSaveDraft,
  onSubmit,
  isSubmitting = false,
  isSavingDraft = false,
  submissionId = null,
  exportStatus,
}: DynamicFormNavigationProps) {
  const {
    template,
    currentSection,
    responses,
    repeatGroups,
    nextSection,
    previousSection,
    submitForm,
    saveDraft,
    setError  // ✅ ADD setError to set validation errors in form state
  } = useFormEngine();

  const [isExporting, setIsExporting] = useState(false);

  if (!template) return null;

  const totalSections = template.sections.length;
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === totalSections - 1;

  const hasResponses = hasResponseValues(responses, repeatGroups);

  const computedExportStatus: SubmissionStatusValue | 'BLANK' | 'IN_PROGRESS' = exportStatus
    ?? (submissionId ? 'DRAFT' : hasResponses ? 'IN_PROGRESS' : 'BLANK');

  const handleExport = async () => {
    if (!template) {
      toast.error('No form template available for export');
      return;
    }

    setIsExporting(true);
    try {
      const payload = {
        templateId: template.id,
        submissionId: submissionId ?? undefined,
        responses,
        repeatGroups,
        status: computedExportStatus,
      };

      const response = await fetch('/api/form-exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await safeReadJson(response);
        const message = errorData?.error ?? 'Failed to generate PDF export';
        toast.error(message);
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = extractFilename(response.headers.get('Content-Disposition'))
        ?? `${template.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'form'}-export.pdf`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('PDF export ready for download');
    } catch (error) {
      console.error('❌ Export PDF failed:', error);
      toast.error('An unexpected error occurred while preparing the PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const skipSectionValidation =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ALLOW_SECTION_SKIP === 'true';

  const handleNext = () => {
    if (isLastSection) {
      return;
    }

    const validationResult = validateCurrentSection();

    if (validationResult.hasErrors) {
      validationResult.errors.forEach((error) => {
        setError(error.fieldCode, error.message);
      });

      if (!skipSectionValidation) {
        console.log('❌ Validation failed, blocking navigation:', validationResult.errors);
        return;
      }

      console.log('⚠️  Validation failed, but advancing due to relaxed section rules');
    }

    nextSection();
  };

  // ✅ ADD validation function for current section
  const validateSections = (sectionsToValidate: typeof template.sections) => {
    const errors: { fieldCode: string; message: string }[] = [];

    sectionsToValidate.forEach((section) => {
      const questions = [...section.questions].sort((a, b) => a.order - b.order);

      for (const question of questions) {
        const conditionalConfig = parseConditionalConfig(question.conditional);
        const isVisible = shouldShowField(conditionalConfig, responses);

        if (!isVisible) continue;

        const isRequired = shouldRequireField(conditionalConfig, question.isRequired, responses);
        const value = responses[question.fieldCode];

        if (isRequired && (value === undefined || value === null || value === '' || value === false || (Array.isArray(value) && value.length === 0))) {
          let errorMessage = `${question.label} is required`;

          if (question.validation) {
            const validationMetadata = parseValidationMetadata(question.validation);
            const rules = Array.isArray(validationMetadata?.rules)
              ? (validationMetadata?.rules as ValidationRule[])
              : [];

            const requiredRule = rules.find((rule) => rule.type === 'required');
            if (requiredRule?.message) {
              errorMessage = requiredRule.message;
            }
          }

          errors.push({ fieldCode: question.fieldCode, message: errorMessage });
        }
      }
    });

    return { hasErrors: errors.length > 0, errors };
  };

  const validateCurrentSection = () => {
    if (!template) return { hasErrors: false, errors: [] };

    const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);
    const currentSectionData = sortedSections[currentSection];

    if (!currentSectionData) return { hasErrors: false, errors: [] };

    return validateSections([currentSectionData]);
  };

  const validateAllSections = () => {
    if (!template) return { hasErrors: false, errors: [] };

    const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);
    return validateSections(sortedSections);
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      previousSection();
    }
  };

  const handleSaveDraft = () => {
    const formData = {
      responses,
      repeatGroups,
      calculatedScores: null // TODO: Implement scoring calculation
    };

    if (onSaveDraft) {
      console.log('💾 Saving draft with data:', formData);
      onSaveDraft(formData);
    } else {
      saveDraft();
    }
  };

  const handleSubmit = () => {
    const formData = {
      responses,
      repeatGroups,
      calculatedScores: null // TODO: Implement scoring calculation
    };

    const validationResult = validateAllSections();

    if (validationResult.hasErrors) {
      validationResult.errors.forEach((error) => {
        setError(error.fieldCode, error.message);
      });
      toast.error('Please fill in all required fields before submitting.');
      return;
    }

    if (onSubmit) {
      console.log('📝 Submitting form with data:', formData);
      onSubmit(formData);
    } else {
      submitForm();
    }
  };

  const progressValue = ((currentSection + 1) / totalSections) * 100;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Section {currentSection + 1} of {totalSections}
            </span>
            <span className="text-muted-foreground">
                {Math.round(progressValue)}% Complete
              </span>
            </div>
            <Progress value={progressValue} className="w-full" />
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            {/* Previous button */}
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstSection}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Preparing...' : 'Export PDF'}
              </Button>
              {/* Next/Save Draft/Submit based on section */}
              {!isLastSection ? (
                <>
                  <Button variant="outline" onClick={handleSaveDraft} disabled={isSavingDraft}>
                    {isSavingDraft ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSavingDraft ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button onClick={handleNext} disabled={isSubmitting || isSavingDraft}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleSaveDraft} disabled={isSavingDraft || isSubmitting}>
                    {isSavingDraft ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSavingDraft ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || isSavingDraft}>
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? 'Submitting...' : 'Submit Form'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function safeReadJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) {
    return null;
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/);
  return match ? match[1] : null;
}

function hasResponseValues(
  responses: Record<string, unknown>,
  repeatGroups: Record<string, unknown>
): boolean {
  const responseHasValue = Object.values(responses).some((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.length > 0;
    return Object.keys(value as object).length > 0;
  });

  const repeatGroupHasValue = Object.values(repeatGroups).some(
    (groupRows) => Array.isArray(groupRows) && groupRows.length > 0
  );

  return responseHasValue || repeatGroupHasValue;
}
