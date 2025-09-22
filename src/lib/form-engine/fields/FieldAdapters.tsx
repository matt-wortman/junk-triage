import React from 'react';
import { FieldType } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScoringComponent } from '@/components/form/ScoringComponent';
import { FieldProps } from '../types';

// Short text field adapter
export const ShortTextField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  return (
    <Input
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder || ''}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
    />
  );
};

// Long text field adapter
export const LongTextField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  return (
    <Textarea
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder || ''}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
      rows={4}
    />
  );
};

// Integer field adapter
export const IntegerField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  return (
    <Input
      type="number"
      value={value as number || ''}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      placeholder={question.placeholder || ''}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
    />
  );
};

// Single select field adapter
export const SingleSelectField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  return (
    <Select value={value as string || ''} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={error ? 'border-red-500' : ''}>
        <SelectValue placeholder={question.placeholder || 'Select an option'} />
      </SelectTrigger>
      <SelectContent>
        {question.options.map((option) => (
          <SelectItem key={option.id} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Multi-select field adapter
export const MultiSelectField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  const selectedValues = (value as string[]) || [];

  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, optionValue]);
    } else {
      onChange(selectedValues.filter(v => v !== optionValue));
    }
  };

  return (
    <div className={`space-y-2 ${error ? 'border border-red-500 rounded p-2' : ''}`}>
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={option.id}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) => handleChange(option.value, checked as boolean)}
            disabled={disabled}
          />
          <label htmlFor={option.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

// Checkbox group field adapter
export const CheckboxGroupField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  const selectedValues = (value as string[]) || [];

  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, optionValue]);
    } else {
      onChange(selectedValues.filter(v => v !== optionValue));
    }
  };

  return (
    <div className={`space-y-3 ${error ? 'border border-red-500 rounded p-2' : ''}`}>
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={option.id}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) => handleChange(option.value, checked as boolean)}
            disabled={disabled}
          />
          <label htmlFor={option.id} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

// Date field adapter
export const DateField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  return (
    <Input
      type="date"
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
    />
  );
};

// Scoring field adapter - uses the existing ScoringComponent
export const ScoringField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  const criteria = question.scoringConfig?.criteria || {};

  return (
    <div className={error ? 'border border-red-500 rounded p-2' : ''}>
      <ScoringComponent
        value={value as number || 0}
        onChange={onChange}
        label={question.label}
        helpText={question.helpText || ''}
        criteria={criteria}
        disabled={disabled}
      />
    </div>
  );
};

// Repeatable group field adapter - placeholder for now
export const RepeatableGroupField: React.FC<FieldProps> = ({ question, error }) => {
  return (
    <div className={`p-4 border rounded-lg ${error ? 'border-red-500' : 'border-gray-200'}`}>
      <p className="text-sm text-gray-600">
        Repeatable Group: {question.label}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Dynamic table implementation coming next
      </p>
    </div>
  );
};

// Field component mapping
export const FieldComponents = {
  [FieldType.SHORT_TEXT]: ShortTextField,
  [FieldType.LONG_TEXT]: LongTextField,
  [FieldType.INTEGER]: IntegerField,
  [FieldType.SINGLE_SELECT]: SingleSelectField,
  [FieldType.MULTI_SELECT]: MultiSelectField,
  [FieldType.CHECKBOX_GROUP]: CheckboxGroupField,
  [FieldType.DATE]: DateField,
  [FieldType.SCORING_0_3]: ScoringField,
  [FieldType.REPEATABLE_GROUP]: RepeatableGroupField,
};