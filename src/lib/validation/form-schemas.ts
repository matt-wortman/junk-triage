import { z } from 'zod';
import { FieldType } from '@prisma/client';

// Base validation schemas for different field types
export const fieldValidationSchemas = {
  [FieldType.SHORT_TEXT]: z.string().min(1, 'This field is required').max(255, 'Text must be less than 255 characters'),
  [FieldType.LONG_TEXT]: z.string().min(1, 'This field is required'),
  [FieldType.INTEGER]: z.number().int('Must be a whole number').min(0, 'Must be non-negative'),
  [FieldType.SINGLE_SELECT]: z.string().min(1, 'Please select an option'),
  [FieldType.MULTI_SELECT]: z.array(z.string()).min(1, 'Please select at least one option'),
  [FieldType.CHECKBOX_GROUP]: z.array(z.string()).min(1, 'Please select at least one option'),
  [FieldType.DATE]: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date'),
  [FieldType.SCORING_0_3]: z.number().int('Score must be a whole number').min(0, 'Score must be at least 0').max(3, 'Score must be at most 3'),
  [FieldType.REPEATABLE_GROUP]: z.array(z.record(z.string(), z.string())).optional(),
};

// Optional versions for non-required fields
export const optionalFieldValidationSchemas = {
  [FieldType.SHORT_TEXT]: z.string().max(255, 'Text must be less than 255 characters').optional(),
  [FieldType.LONG_TEXT]: z.string().optional(),
  [FieldType.INTEGER]: z.number().int('Must be a whole number').min(0, 'Must be non-negative').optional(),
  [FieldType.SINGLE_SELECT]: z.string().optional(),
  [FieldType.MULTI_SELECT]: z.array(z.string()).optional(),
  [FieldType.CHECKBOX_GROUP]: z.array(z.string()).optional(),
  [FieldType.DATE]: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date').optional(),
  [FieldType.SCORING_0_3]: z.number().int('Score must be a whole number').min(0, 'Score must be at least 0').max(3, 'Score must be at most 3').optional(),
  [FieldType.REPEATABLE_GROUP]: z.array(z.record(z.string(), z.string())).optional(),
};

// Specific validation schemas for known field codes
export const specificFieldValidations = {
  // Technology ID should be alphanumeric
  'F0.1': z.string().min(1, 'Technology ID is required').regex(/^[A-Za-z0-9-]+$/, 'Technology ID should contain only letters, numbers, and hyphens'),

  // Date field should be properly formatted
  'F0.4': z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date'),

  // Market overview allows hyperlinks
  'F4.1.a': z.string().min(1, 'Market overview is required'),

  // Scoring fields with specific criteria
  'F2.1.score': z.number().int().min(0).max(3),
  'F2.2.score': z.number().int().min(0).max(3),
  'F3.2.score': z.number().int().min(0).max(3),
  'F4.4.a': z.number().int().min(0).max(3),
  'F4.4.b': z.number().int().min(0).max(3),
  'F4.4.c': z.number().int().min(0).max(3),
};

// Repeatable group validation schemas
export const competitiveLandscapeSchema = z.array(
  z.object({
    company: z.string().min(1, 'Company name is required'),
    product: z.string().min(1, 'Product name is required'),
    description: z.string().min(1, 'Description is required'),
    revenue: z.string().optional(),
  })
);

export const subjectMatterExpertsSchema = z.array(
  z.object({
    name: z.string().min(1, 'Expert name is required'),
    expertise: z.string().min(1, 'Expertise area is required'),
    contact: z.string().min(1, 'Contact information is required'),
  })
);

/**
 * Get validation schema for a specific field
 */
export function getFieldValidationSchema(
  fieldCode: string,
  fieldType: FieldType,
  isRequired: boolean,
  customValidation?: any
): z.ZodSchema {
  // Check for specific field validation first
  if (specificFieldValidations[fieldCode as keyof typeof specificFieldValidations]) {
    return specificFieldValidations[fieldCode as keyof typeof specificFieldValidations];
  }

  // Handle repeatable groups
  if (fieldType === FieldType.REPEATABLE_GROUP) {
    if (fieldCode === 'F4.2.a') {
      return competitiveLandscapeSchema;
    }
    if (fieldCode === 'F6.4') {
      return subjectMatterExpertsSchema;
    }
    return fieldValidationSchemas[fieldType];
  }

  // Use required or optional schema based on field requirements
  if (isRequired) {
    return fieldValidationSchemas[fieldType];
  } else {
    return optionalFieldValidationSchemas[fieldType];
  }
}

/**
 * Validate a single field value
 */
export function validateField(
  fieldCode: string,
  fieldType: FieldType,
  value: unknown,
  isRequired: boolean,
  customValidation?: any
): { isValid: boolean; error?: string } {
  try {
    const schema = getFieldValidationSchema(fieldCode, fieldType, isRequired, customValidation);
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.issues[0]?.message || 'Validation failed'
      };
    }
    return {
      isValid: false,
      error: 'Validation error'
    };
  }
}

/**
 * Validate all form responses
 */
export function validateFormData(
  responses: Record<string, unknown>,
  repeatGroups: Record<string, unknown[]>,
  questions: Array<{
    fieldCode: string;
    type: FieldType;
    isRequired: boolean;
    validation?: any;
  }>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate regular responses
  for (const question of questions) {
    if (question.type === FieldType.REPEATABLE_GROUP) {
      // Handle repeatable groups separately
      const groupData = repeatGroups[question.fieldCode] || [];
      const result = validateField(
        question.fieldCode,
        question.type,
        groupData,
        question.isRequired,
        question.validation
      );

      if (!result.isValid && result.error) {
        errors[question.fieldCode] = result.error;
      }
    } else {
      // Handle regular fields
      const value = responses[question.fieldCode];
      const result = validateField(
        question.fieldCode,
        question.type,
        value,
        question.isRequired,
        question.validation
      );

      if (!result.isValid && result.error) {
        errors[question.fieldCode] = result.error;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Real-time validation hook for form fields
 */
export function useFieldValidation(
  fieldCode: string,
  fieldType: FieldType,
  value: unknown,
  isRequired: boolean,
  customValidation?: any
) {
  const result = validateField(fieldCode, fieldType, value, isRequired, customValidation);
  return result;
}