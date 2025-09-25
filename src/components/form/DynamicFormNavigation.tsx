import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { useFormEngine } from '@/lib/form-engine/renderer';
import { shouldShowField, shouldRequireField, parseConditionalConfig } from '@/lib/form-engine/conditional-logic';
import { ValidationRule } from '@/lib/form-engine/types';
import { parseValidationMetadata } from '@/lib/form-engine/json-utils';

interface DynamicFormNavigationProps {
  onSaveDraft?: (data: { responses: Record<string, unknown>; repeatGroups: Record<string, unknown>; calculatedScores: unknown }) => void;
  onSubmit?: (data: { responses: Record<string, unknown>; repeatGroups: Record<string, unknown>; calculatedScores: unknown }) => void;
  isSubmitting?: boolean;
  isSavingDraft?: boolean;
}

export function DynamicFormNavigation({ onSaveDraft, onSubmit, isSubmitting = false, isSavingDraft = false }: DynamicFormNavigationProps) {
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

  if (!template) return null;

  const totalSections = template.sections.length;
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === totalSections - 1;

  const handleNext = () => {
    if (!isLastSection) {
      // ✅ VALIDATE current section before advancing
      const validationResult = validateCurrentSection();
      if (validationResult.hasErrors) {
        // ✅ SET validation errors in form state to display to user
        validationResult.errors.forEach(error => {
          setError(error.fieldCode, error.message);
        });
        console.log('❌ Validation failed, blocking navigation:', validationResult.errors);
        return;
      }
      nextSection(); // ✅ ONLY advance if validation passes
    }
  };

  // ✅ ADD validation function for current section
  const validateCurrentSection = () => {
    if (!template) return { hasErrors: false, errors: [] };

    const currentSectionData = template.sections
      .sort((a, b) => a.order - b.order)[currentSection];

    if (!currentSectionData) return { hasErrors: false, errors: [] };

    const errors: { fieldCode: string; message: string }[] = [];

    // Check each question in current section
    for (const question of currentSectionData.questions) {
      // Skip if question is not visible based on conditional logic
      const conditionalConfig = parseConditionalConfig(question.conditional);
      const isVisible = shouldShowField(conditionalConfig, responses);

      if (!isVisible) continue;

      // Check if required field is empty
      const isRequired = shouldRequireField(conditionalConfig, question.isRequired, responses);
      const value = responses[question.fieldCode];

      if (isRequired && (!value || value === '' || value === null || value === undefined)) {
        // ✅ Extract error message from validation rules if available
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

    return { hasErrors: errors.length > 0, errors };
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
