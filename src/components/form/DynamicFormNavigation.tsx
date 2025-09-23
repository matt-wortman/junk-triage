import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { useFormEngine } from '@/lib/form-engine/renderer';

interface DynamicFormNavigationProps {
  onSaveDraft?: (data: { responses: Record<string, unknown>; repeatGroups: Record<string, unknown>; calculatedScores: unknown }) => void;
  onSubmit?: (data: { responses: Record<string, unknown>; repeatGroups: Record<string, unknown>; calculatedScores: unknown }) => void;
}

export function DynamicFormNavigation({ onSaveDraft, onSubmit }: DynamicFormNavigationProps) {
  const {
    template,
    currentSection,
    responses,
    repeatGroups,
    nextSection,
    previousSection,
    submitForm,
    saveDraft
  } = useFormEngine();

  if (!template) return null;

  const totalSections = template.sections.length;
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === totalSections - 1;

  const handleNext = () => {
    if (!isLastSection) {
      nextSection();
    }
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
                  <Button variant="outline" onClick={handleSaveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleSaveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button onClick={handleSubmit}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Form
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