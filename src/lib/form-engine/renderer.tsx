import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  FormTemplateWithSections,
  FormSectionWithQuestions,
  FormQuestionWithDetails,
  FormState,
  FormAction,
  FormContext,
  FormResponse,
  RepeatableGroupData,
  CalculatedScores
} from './types';
import { shouldShowField, shouldRequireField, parseConditionalConfig } from './conditional-logic';
import { getDefaultValue } from './field-mappings-simple';
import { FieldComponents } from './fields/FieldAdapters';

// Form state reducer
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return {
        ...state,
        template: action.payload,
        responses: {},
        repeatGroups: {},
        currentSection: 0,
        errors: {},
        calculatedScores: null
      };

    case 'SET_RESPONSE':
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.payload.fieldCode]: action.payload.value
        },
        isDirty: true
      };

    case 'SET_REPEAT_GROUP':
      return {
        ...state,
        repeatGroups: {
          ...state.repeatGroups,
          [action.payload.fieldCode]: action.payload.data
        },
        isDirty: true
      };

    case 'SET_CURRENT_SECTION':
      return {
        ...state,
        currentSection: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.fieldCode]: action.payload.error
        }
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {}
      };

    case 'SET_CALCULATED_SCORES':
      return {
        ...state,
        calculatedScores: action.payload
      };

    case 'RESET_FORM':
      return {
        template: null,
        responses: {},
        repeatGroups: {},
        currentSection: 0,
        isLoading: false,
        isDirty: false,
        errors: {},
        calculatedScores: null
      };

    default:
      return state;
  }
}

// Form context
const FormEngineContext = createContext<FormContext | null>(null);

// Hook to use form context
function useFormEngine(): FormContext {
  const context = useContext(FormEngineContext);
  if (!context) {
    throw new Error('useFormEngine must be used within a FormEngineProvider');
  }
  return context;
}

// Form provider component
interface FormEngineProviderProps {
  children: React.ReactNode;
  template: FormTemplateWithSections;
  onSubmit?: (data: {
    responses: FormResponse;
    repeatGroups: RepeatableGroupData;
    calculatedScores: CalculatedScores | null;
  }) => Promise<void>;
  onSaveDraft?: (data: {
    responses: FormResponse;
    repeatGroups: RepeatableGroupData;
    calculatedScores: CalculatedScores | null;
  }) => Promise<void>;
  initialData?: {
    responses?: FormResponse;
    repeatGroups?: RepeatableGroupData;
  };
}

function FormEngineProvider({
  children,
  template,
  onSubmit,
  onSaveDraft,
  initialData
}: FormEngineProviderProps) {
  const initialState: FormState = {
    template: null,
    responses: initialData?.responses || {},
    repeatGroups: initialData?.repeatGroups || {},
    currentSection: 0,
    isLoading: false,
    isDirty: false,
    errors: {},
    calculatedScores: null
  };

  const [state, dispatch] = useReducer(formReducer, initialState);

  // Initialize template
  useEffect(() => {
    if (template) {
      dispatch({ type: 'SET_TEMPLATE', payload: template });
    }
  }, [template]);

  // Context methods
  const setResponse = (fieldCode: string, value: string | number | boolean | string[] | Record<string, unknown>) => {
    dispatch({ type: 'SET_RESPONSE', payload: { fieldCode, value } });

    // Clear any existing error for this field
    if (state.errors[fieldCode]) {
      dispatch({ type: 'SET_ERROR', payload: { fieldCode, error: '' } });
    }
  };

  const setRepeatGroupData = (fieldCode: string, data: Record<string, unknown>[]) => {
    dispatch({ type: 'SET_REPEAT_GROUP', payload: { fieldCode, data } });
  };

  const nextSection = () => {
    if (state.template && state.currentSection < state.template.sections.length - 1) {
      dispatch({ type: 'SET_CURRENT_SECTION', payload: state.currentSection + 1 });
    }
  };

  const previousSection = () => {
    if (state.currentSection > 0) {
      dispatch({ type: 'SET_CURRENT_SECTION', payload: state.currentSection - 1 });
    }
  };

  const submitForm = async () => {
    if (!onSubmit) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await onSubmit({
        responses: state.responses,
        repeatGroups: state.repeatGroups,
        calculatedScores: state.calculatedScores
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveDraft = async () => {
    if (!onSaveDraft) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await onSaveDraft({
        responses: state.responses,
        repeatGroups: state.repeatGroups,
        calculatedScores: state.calculatedScores
      });
    } catch (error) {
      console.error('Draft save error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const contextValue: FormContext = {
    template: state.template!,
    responses: state.responses,
    repeatGroups: state.repeatGroups,
    currentSection: state.currentSection,
    isLoading: state.isLoading,
    errors: state.errors,
    setResponse,
    setRepeatGroupData,
    nextSection,
    previousSection,
    submitForm,
    saveDraft
  };

  return (
    <FormEngineContext.Provider value={contextValue}>
      {children}
    </FormEngineContext.Provider>
  );
}

// Dynamic question renderer component
interface DynamicQuestionProps {
  question: FormQuestionWithDetails;
  className?: string;
}

function DynamicQuestion({ question, className = '' }: DynamicQuestionProps) {
  const { responses, setResponse, errors } = useFormEngine();

  // Check if question should be visible
  const conditionalConfig = parseConditionalConfig(question.conditional);
  const isVisible = shouldShowField(conditionalConfig, responses);

  if (!isVisible) {
    return null;
  }

  // Check if question should be required
  const isRequired = shouldRequireField(conditionalConfig, question.isRequired, responses);

  // Get field value
  const value = responses[question.fieldCode] ?? getDefaultValue(question.type);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-1">
        <label htmlFor={question.fieldCode} className="text-sm font-medium">
          {question.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-sm text-gray-600">{question.helpText}</p>
        )}
      </div>

      {/* Dynamic field rendering using adapters */}
      {(() => {
        const FieldComponent = FieldComponents[question.type];
        if (!FieldComponent) {
          return (
            <div className="p-4 border rounded bg-red-50">
              <p className="text-sm text-red-600">
                Unsupported field type: {question.type}
              </p>
            </div>
          );
        }

        return (
          <FieldComponent
            question={question}
            value={value}
            onChange={(newValue) => setResponse(question.fieldCode, newValue)}
            error={errors[question.fieldCode]}
            disabled={false}
          />
        );
      })()}

      {errors[question.fieldCode] && (
        <p className="text-sm text-red-500">{errors[question.fieldCode]}</p>
      )}
    </div>
  );
}

// Dynamic section renderer component
interface DynamicSectionProps {
  section: FormSectionWithQuestions;
  className?: string;
}

function DynamicSection({ section, className = '' }: DynamicSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{section.title}</h2>
        {section.description && (
          <p className="text-gray-600">{section.description}</p>
        )}
      </div>

      <div className="space-y-4">
        {section.questions
          .sort((a, b) => a.order - b.order)
          .map((question) => (
            <DynamicQuestion
              key={question.id}
              question={question}
              className="p-4 border rounded-lg"
            />
          ))}
      </div>
    </div>
  );
}

// Main dynamic form renderer component
interface DynamicFormRendererProps {
  className?: string;
}

function DynamicFormRenderer({ className = '' }: DynamicFormRendererProps) {
  const { template, currentSection } = useFormEngine();

  if (!template) {
    return <div>Loading form template...</div>;
  }

  const currentSectionData = template.sections
    .sort((a, b) => a.order - b.order)[currentSection];

  if (!currentSectionData) {
    return <div>Section not found</div>;
  }

  return (
    <div className={className}>
      <DynamicSection section={currentSectionData} />
    </div>
  );
}

// Export all components and hooks
export {
  FormEngineProvider,
  DynamicFormRenderer,
  DynamicSection,
  DynamicQuestion,
  useFormEngine
};