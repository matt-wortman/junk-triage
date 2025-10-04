import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { ChevronLeft, ChevronRight, Download, Save, Send } from 'lucide-react';

interface NavigationProps {
  currentSection: number;
  totalSections: number;
  isFirstSection: boolean;
  isLastSection: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  onExport?: () => void;
}

export function Navigation({
  currentSection,
  totalSections,
  isFirstSection,
  isLastSection,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmit,
  onExport,
}: NavigationProps) {
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
              onClick={onPrevious}
              disabled={isFirstSection}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>

              {/* Next/Save Draft/Submit based on section */}
              {!isLastSection ? (
                <>
                  <Button variant="outline" onClick={onSaveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button onClick={onNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={onSaveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button onClick={onSubmit}>
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
