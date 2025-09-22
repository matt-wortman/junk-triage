import { FieldType, FormTemplate, FormSection, FormQuestion, QuestionOption, ScoringConfig } from '@prisma/client';

// Extended types with relationships for the form engine
export type FormTemplateWithSections = FormTemplate & {
  sections: FormSectionWithQuestions[];
};

export type FormSectionWithQuestions = FormSection & {
  questions: FormQuestionWithDetails[];
};

export type FormQuestionWithDetails = FormQuestion & {
  options: QuestionOption[];
  scoringConfig: ScoringConfig | null;
};

// Form response types
export interface FormResponse {
  [fieldCode: string]: string | number | boolean | string[] | Record<string, unknown>;
}

export interface RepeatableGroupData {
  [fieldCode: string]: Array<Record<string, unknown>>;
}

export interface FormSubmissionData {
  templateId: string;
  submittedBy: string;
  responses: FormResponse;
  repeatGroups: RepeatableGroupData;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'ARCHIVED';
}

// Conditional logic types
export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value: string | number | boolean | null;
  action: 'show' | 'hide' | 'require' | 'optional';
}

export interface ConditionalConfig {
  rules: ConditionalRule[];
  logic: 'AND' | 'OR'; // How to combine multiple rules
}

// Validation types
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom' | 'email' | 'url' | 'number';
  value?: string | number;
  message: string;
}

export interface ValidationConfig {
  rules: ValidationRule[];
}

// Field rendering types
export interface FieldProps {
  question: FormQuestionWithDetails;
  value: string | number | boolean | string[] | Record<string, unknown>;
  onChange: (value: string | number | boolean | string[] | Record<string, unknown>) => void;
  error?: string;
  disabled?: boolean;
}

export interface ScoringFieldProps extends FieldProps {
  onScoreChange?: (score: number) => void;
}

export interface RepeatableGroupProps extends FieldProps {
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onUpdateRow: (index: number, data: Record<string, unknown>) => void;
}

// Form renderer context
export interface FormContext {
  template: FormTemplateWithSections;
  responses: FormResponse;
  repeatGroups: RepeatableGroupData;
  currentSection: number;
  isLoading: boolean;
  errors: { [fieldCode: string]: string };
  setResponse: (fieldCode: string, value: string | number | boolean | string[] | Record<string, unknown>) => void;
  setRepeatGroupData: (fieldCode: string, data: Record<string, unknown>[]) => void;
  nextSection: () => void;
  previousSection: () => void;
  submitForm: () => Promise<void>;
  saveDraft: () => Promise<void>;
}

// Component mapping
export type FieldComponent = React.ComponentType<FieldProps>;
export type ScoringComponent = React.ComponentType<ScoringFieldProps>;
export type RepeatableComponent = React.ComponentType<RepeatableGroupProps>;

export interface FieldTypeMapping {
  [FieldType.SHORT_TEXT]: FieldComponent;
  [FieldType.LONG_TEXT]: FieldComponent;
  [FieldType.INTEGER]: FieldComponent;
  [FieldType.SINGLE_SELECT]: FieldComponent;
  [FieldType.MULTI_SELECT]: FieldComponent;
  [FieldType.CHECKBOX_GROUP]: FieldComponent;
  [FieldType.DATE]: FieldComponent;
  [FieldType.REPEATABLE_GROUP]: RepeatableComponent;
  [FieldType.SCORING_0_3]: ScoringComponent;
}

// Scoring calculation types
export interface ScoreConfig {
  fieldCode: string;
  weight: number;
  groupType: 'impact' | 'value' | 'market';
}

export interface CalculatedScores {
  impactScore: number;
  valueScore: number;
  marketScore: number;
  recommendation: string;
  recommendationText: string;
}

// Form state management
export interface FormState {
  template: FormTemplateWithSections | null;
  responses: FormResponse;
  repeatGroups: RepeatableGroupData;
  currentSection: number;
  isLoading: boolean;
  isDirty: boolean;
  errors: { [fieldCode: string]: string };
  calculatedScores: CalculatedScores | null;
}

export type FormAction =
  | { type: 'SET_TEMPLATE'; payload: FormTemplateWithSections }
  | { type: 'SET_RESPONSE'; payload: { fieldCode: string; value: string | number | boolean | string[] | Record<string, unknown> } }
  | { type: 'SET_REPEAT_GROUP'; payload: { fieldCode: string; data: Record<string, unknown>[] } }
  | { type: 'SET_CURRENT_SECTION'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { fieldCode: string; error: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_CALCULATED_SCORES'; payload: CalculatedScores }
  | { type: 'RESET_FORM' };

export { FieldType };