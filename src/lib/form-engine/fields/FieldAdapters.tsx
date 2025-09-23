import React from 'react';
import { FieldType } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScoringComponent } from '@/components/form/ScoringComponent';
import { DynamicScoringMatrix } from '@/components/form/DynamicScoringMatrix';
import { FieldProps } from '../types';
import { Trash2, Plus } from 'lucide-react';

// Short text field adapter
export const ShortTextField: React.FC<FieldProps> = ({ question, value, onChange, error, disabled }) => {
  console.log('SHORT TEXT FIELD DEBUG:', {
    fieldCode: question.fieldCode,
    validation: question.validation,
    validationType: typeof question.validation
  });

  // Check if this is an info box
  let validationObj = question.validation;

  // Parse validation if it's a string (same logic as renderer)
  if (typeof question.validation === 'string') {
    try {
      validationObj = JSON.parse(question.validation);
      console.log('PARSED VALIDATION:', validationObj);
    } catch (e) {
      validationObj = {};
      console.log('FAILED TO PARSE VALIDATION:', e);
    }
  }

  const isInfoBox = validationObj &&
    typeof validationObj === 'object' &&
    'isInfoBox' in validationObj &&
    validationObj.isInfoBox;

  console.log('INFO BOX CHECK:', {
    isInfoBox,
    validationObj,
    fieldCode: question.fieldCode
  });

  if (isInfoBox) {
    console.log('INFO BOX DETECTED! Rendering hardcoded list.');
    const infoBoxStyle = validationObj.infoBoxStyle || 'blue';
    const styleClasses = infoBoxStyle === 'blue'
      ? 'bg-blue-50 border-blue-200 text-blue-800'
      : 'bg-gray-50 border-gray-200 text-gray-800';

    return (
      <div className={`border rounded-lg p-4 ${styleClasses}`}>
        <h4 className="text-sm font-medium mb-2">{question.label}</h4>
        <ul className="text-sm space-y-1">
          <li>
            • <strong>Improves Child Health:</strong> Direct impact on pediatric health outcomes
          </li>
          <li>
            • <strong>Transforms Delivery of Care:</strong> Changes how care is provided or accessed
          </li>
          <li>
            • <strong>POPT Goals:</strong> Aligns with Portfolio of the Future strategic objectives
          </li>
        </ul>
      </div>
    );
  }

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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {fieldConfig.map((field) => (
                  <TableHead key={field.key}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </TableHead>
                ))}
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  {fieldConfig.map((field) => (
                    <TableCell key={field.key}>
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
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addRow}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add {fieldConfig.length > 1 ? 'Row' : 'Item'}
      </Button>

      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
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