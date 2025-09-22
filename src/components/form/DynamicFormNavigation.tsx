import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { useFormEngine } from '@/lib/form-engine/renderer';

interface DynamicFormNavigationProps {
  onSaveDraft?: () => void;
  onSubmit?: () => void;
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
      onSaveDraft();
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
      onSubmit();
    } else {
      submitForm();
    }
  };

  return (
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

      {/* Section indicator */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          Section {currentSection + 1} of {totalSections}
        </span>

        {/* Progress bar */}
        <div className="w-48 bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
          />
        </div>
      </div>

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
  );
}