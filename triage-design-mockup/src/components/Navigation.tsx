import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { ChevronLeft, ChevronRight, Download, Save, Send } from 'lucide-react';
import type { Theme } from '../themes';

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
  theme?: Theme;
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
  theme,
}: NavigationProps) {
  const progressValue = ((currentSection + 1) / totalSections) * 100;
  const isNeumorphism = theme?.id === 'neumorphism';

  const NavButton = ({ children, onClick, disabled, variant = 'outline' }: any) => {
    if (isNeumorphism) {
      const baseClass = theme?.button?.[variant === 'outline' ? 'outlineClass' : 'primaryClass'] || '';
      return (
        <button
          onClick={onClick}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium flex items-center ${baseClass} ${disabled ? theme?.button?.disabledClass : ''}`}
        >
          {children}
        </button>
      );
    }
    return (
      <Button variant={variant} onClick={onClick} disabled={disabled}>
        {children}
      </Button>
    );
  };

  return (
    <Card className={isNeumorphism ? 'bg-[#e0e5ec] shadow-none border-0' : ''}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={isNeumorphism ? 'text-[#6b7280]' : 'text-muted-foreground'}>
                Section {currentSection + 1} of {totalSections}
              </span>
              <span className={isNeumorphism ? 'text-[#6b7280]' : 'text-muted-foreground'}>
                {Math.round(progressValue)}% Complete
              </span>
            </div>
            {isNeumorphism && theme?.progress ? (
              <div className={theme.progress.containerClass}>
                <div className={theme.progress.barClass} style={{ width: `${progressValue}%` }} />
              </div>
            ) : (
              <Progress value={progressValue} className="w-full" />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            {/* Previous button */}
            <NavButton onClick={onPrevious} disabled={isFirstSection}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </NavButton>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <NavButton onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </NavButton>

              {/* Next/Save Draft/Submit based on section */}
              {!isLastSection ? (
                <>
                  <NavButton onClick={onSaveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </NavButton>
                  <NavButton onClick={onNext} variant="default">
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </NavButton>
                </>
              ) : (
                <>
                  <NavButton onClick={onSaveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </NavButton>
                  <NavButton onClick={onSubmit} variant="default">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Form
                  </NavButton>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
