import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import type { FormField } from '../data/mockFormData';
import type { Theme } from '../themes';

interface QuestionCardProps {
  field: FormField;
  theme: Theme;
}

export function QuestionCard({ field, theme }: QuestionCardProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            rows={theme.input.textareaRows}
            className={theme.input.textareaResize}
          />
        );

      case 'date':
        return (
          <Input
            id={field.id}
            type="text"
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-muted-foreground">{field.placeholder}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 opacity-50"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        );

      case 'table':
        return (
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add row
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              No entries yet. Click "Add row" to create the first entry.
            </p>
          </div>
        );

      case 'scoring':
        return (
          <div className="space-y-3">
            {field.scoringCriteria && (
              <div className="text-sm bg-muted p-3 rounded-md">
                <span className="font-medium">Scoring Criteria: </span>
                {field.scoringCriteria}
              </div>
            )}
            <div className="flex gap-2">
              {Array.from({ length: (field.scoringMax || 3) + 1 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex-1 h-12 rounded-md border-2 border-input bg-background hover:bg-accent hover:border-primary transition-colors text-sm font-medium"
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <button
                  type="button"
                  className="h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <button
                  type="button"
                  className="h-4 w-4 rounded border border-input bg-background ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const cardClasses = [
    theme.questionCard.background,
    theme.questionCard.border,
    theme.questionCard.shadow,
    theme.questionCard.borderRadius,
  ].filter(Boolean).join(' ');

  const labelClasses = [
    theme.questionLabel.size,
    theme.questionLabel.weight,
    theme.questionLabel.color,
  ].filter(Boolean).join(' ');

  const asteriskClasses = [
    'text-red-500',
    theme.questionLabel.asteriskMargin,
  ].filter(Boolean).join(' ');

  return (
    <Card className={cardClasses}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={field.id} className={labelClasses}>
              {field.label}
              {field.required && <span className={asteriskClasses}>*</span>}
            </Label>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
          {renderField()}
        </div>
      </CardContent>
    </Card>
  );
}
