import React from 'react';
import { FieldType } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScoringComponent } from '@/components/form/ScoringComponent';
import { DynamicScoringMatrix } from '@/components/form/DynamicScoringMatrix';
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
export const DateField: React.FC<FieldProps> = ({ value, onChange, error, disabled }) => {
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
export const ScoringField: React.FC<FieldProps> = ({ question, value, onChange, error }) => {
  // Parse the criteria JSON string from the database
  let criteria = {
    "0": "No alignment",
    "1": "Limited alignment",
    "2": "Good alignment",
    "3": "Excellent alignment"
  };

  if (question.scoringConfig?.criteria) {
    try {
      criteria = typeof question.scoringConfig.criteria === 'string'
        ? JSON.parse(question.scoringConfig.criteria)
        : question.scoringConfig.criteria;
    } catch (error) {
      console.warn('Failed to parse scoring criteria JSON:', error);
    }
  }

  return (
    <div className={error ? 'border border-red-500 rounded p-2' : ''}>
      <ScoringComponent
        value={value as number || 0}
        onChange={(score: number) => onChange(score)}
        label={question.label}
        criteria={criteria}
        required={question.isRequired}
      />
    </div>
  );
};

// Repeatable group field adapter - dynamic table with add/remove rows
export const RepeatableGroupField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

  // Get field configuration from question metadata
  const getFieldConfig = () => {
    const fieldCode = question.fieldCode;

    // Competitive landscape table (F4.2.a)
    if (fieldCode === 'F4.2.a') {
      return [
        { key: 'company', label: 'Company', type: 'text', required: true },
        { key: 'product', label: 'Product or Solution', type: 'text', required: true },
        { key: 'description', label: 'Description and Key Features', type: 'textarea', required: true },
        { key: 'revenue', label: 'Revenue or Market Share', type: 'text', required: false }
      ];
    }

    // Subject matter experts table (F6.4)
    if (fieldCode === 'F6.4') {
      return [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'expertise', label: 'Expertise', type: 'text', required: true },
        { key: 'contact', label: 'Contact Information', type: 'text', required: true }
      ];
    }

    // Default configuration
    return [
      { key: 'value', label: 'Value', type: 'text', required: true }
    ];
  };

  const fieldConfig = getFieldConfig();

  const addRow = () => {
    const newRow: Record<string, unknown> = {};
    fieldConfig.forEach(field => {
      newRow[field.key] = '';
    });
    onChange([...rows, newRow] as unknown as Record<string, unknown>);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    onChange(newRows as unknown as Record<string, unknown>);
  };

  const updateRow = (index: number, field: string, newValue: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: newValue };
    onChange(newRows as unknown as Record<string, unknown>);
  };

  return (
    <div className={`space-y-4 ${error ? 'border border-red-500 rounded-lg p-4' : ''}`}>
      {rows.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {fieldConfig.map((field) => (
                  <th key={field.key} className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {fieldConfig.map((field) => (
                    <td key={field.key} className="px-4 py-3">
                      {field.type === 'textarea' ? (
                        <Textarea
                          value={String(row[field.key] || '')}
                          onChange={(e) => updateRow(index, field.key, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          disabled={disabled}
                          className="min-h-[60px]"
                          rows={2}
                        />
                      ) : (
                        <Input
                          value={String(row[field.key] || '')}
                          onChange={(e) => updateRow(index, field.key, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          disabled={disabled}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        disabled={disabled}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Add {fieldConfig.length > 1 ? 'Row' : 'Item'}
      </button>

      {rows.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No entries yet. Click "Add {fieldConfig.length > 1 ? 'Row' : 'Item'}" to get started.
        </p>
      )}
    </div>
  );
};

// Scoring matrix field adapter - renders the comprehensive scoring matrix
export const ScoringMatrixField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  return (
    <DynamicScoringMatrix
      question={question}
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
    />
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
  [FieldType.SCORING_MATRIX]: ScoringMatrixField,
};