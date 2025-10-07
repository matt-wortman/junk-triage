import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Plus, User, Users, Stethoscope } from 'lucide-react';
import type { FormField } from '../data/mockFormData';
import type { Theme } from '../themes';

interface QuestionCardProps {
  field: FormField;
  theme: Theme;
}

export function QuestionCard({ field, theme }: QuestionCardProps) {
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]);
  // Neumorphism button/dropdown styling
  const isNeumorphism = theme.id === 'neumorphism';
  const neumorphicButtonClass = isNeumorphism
    ? 'bg-[#e0e5ec] [box-shadow:5px_5px_10px_0px_#a3b1c6,_-5px_-5px_10px_0px_rgba(255,255,255,0.6)] hover:[box-shadow:3px_3px_6px_0px_#a3b1c6,_-3px_-3px_6px_0px_rgba(255,255,255,0.6)] active:[box-shadow:inset_3px_3px_6px_0px_rgba(163,177,198,0.4),_inset_-3px_-3px_6px_0px_rgba(255,255,255,0.6)] border-0'
    : '';

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            className={theme.input.className}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            rows={theme.input.textareaRows}
            className={`${theme.input.textareaResize} ${theme.input.className || ''}`}
          />
        );

      case 'date':
        return (
          <Input
            id={field.id}
            type="text"
            placeholder={field.placeholder}
            className={theme.input.className}
          />
        );

      case 'select':
        return (
          <button
            type="button"
            className={`flex h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              isNeumorphism
                ? neumorphicButtonClass + ' text-[#353535]'
                : 'border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2'
            }`}
          >
            <span className={isNeumorphism ? 'text-[#6b7280]' : 'text-muted-foreground'}>{field.placeholder}</span>
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
            {isNeumorphism ? (
              <button
                type="button"
                className={`w-full flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all ${neumorphicButtonClass} text-[#353535]`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add row
              </button>
            ) : (
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add row
              </Button>
            )}
            <p className={`text-sm text-center ${isNeumorphism ? 'text-[#6b7280]' : 'text-muted-foreground'}`}>
              No entries yet. Click "Add row" to create the first entry.
            </p>
          </div>
        );

      case 'scoring':
        return (
          <div className="space-y-3">
            {field.scoringCriteria && (
              <div className={`text-sm p-3 rounded-md ${isNeumorphism ? 'bg-[#f0f4f8] text-[#353535]' : 'bg-muted'}`}>
                <span className="font-medium">Scoring Criteria: </span>
                {field.scoringCriteria}
              </div>
            )}
            <div className="flex gap-2">
              {Array.from({ length: (field.scoringMax || 3) + 1 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`flex-1 h-12 rounded-xl text-sm font-medium transition-all ${
                    isNeumorphism
                      ? neumorphicButtonClass + ' text-[#353535]'
                      : 'border-2 border-input bg-background hover:bg-accent hover:border-primary'
                  }`}
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

      case 'stakeholders':
        const stakeholders = [
          { id: 'patients', label: 'Patients', icon: User, description: 'How do patients benefit from this technology?' },
          { id: 'caregivers', label: 'Caregivers', icon: Users, description: 'How do caregivers benefit from this technology?' },
          { id: 'clinicians', label: 'Clinicians', icon: Stethoscope, description: 'How do clinicians benefit from this technology?' },
        ];

        const toggleStakeholder = (id: string) => {
          setSelectedStakeholders(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
          );
        };

        return (
          <div className="grid md:grid-cols-2 gap-6">
            {stakeholders.map((stakeholder) => {
              const Icon = stakeholder.icon;
              const isSelected = selectedStakeholders.includes(stakeholder.id);

              return (
                <Card
                  key={stakeholder.id}
                  className={`${isNeumorphism ? 'bg-white border-0 rounded-2xl' : ''} ${
                    isSelected && isNeumorphism
                      ? '[box-shadow:inset_3px_3px_6px_0px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_0px_rgba(255,255,255,0.6)]'
                      : isNeumorphism
                      ? '[box-shadow:5px_5px_10px_0px_#a3b1c6,_-5px_-5px_10px_0px_rgba(255,255,255,0.6)]'
                      : ''
                  } transition-all cursor-pointer hover:scale-[1.02]`}
                  onClick={() => toggleStakeholder(stakeholder.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Icon Button */}
                      <button
                        type="button"
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#e0e5ec] [box-shadow:inset_3px_3px_6px_0px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_0px_rgba(255,255,255,0.6)]'
                            : 'bg-[#e0e5ec] [box-shadow:5px_5px_10px_0px_#a3b1c6,_-5px_-5px_10px_0px_rgba(255,255,255,0.6)]'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStakeholder(stakeholder.id);
                        }}
                      >
                        <Icon className={`h-8 w-8 ${isSelected ? 'text-[#60a5fa]' : 'text-[#353535]'}`} />
                      </button>

                      {/* Label */}
                      <div>
                        <h4 className={`font-medium ${isNeumorphism ? 'text-[#353535]' : ''}`}>
                          {stakeholder.label}
                        </h4>
                        {isSelected && (
                          <div className="mt-3">
                            <Textarea
                              placeholder={stakeholder.description}
                              rows={3}
                              className={theme.input.className}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
