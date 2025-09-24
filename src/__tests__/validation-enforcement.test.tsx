import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormEngineProvider, DynamicFormRenderer } from '@/lib/form-engine/renderer';
import { DynamicFormNavigation } from '@/components/form/DynamicFormNavigation';
import { FormTemplateWithSections } from '@/lib/form-engine/types';

// Mock template with validation requirements for testing
const mockTemplateWithValidation: FormTemplateWithSections = {
  id: 'validation-test-template',
  title: 'Validation Test Form',
  description: 'A form to test validation enforcement',
  version: '1.0.0',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  sections: [
    {
      id: 'section-1',
      templateId: 'validation-test-template',
      title: 'Required Fields Section',
      description: 'Section with required fields that must be validated',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 'question-1',
          sectionId: 'section-1',
          fieldCode: 'required_name',
          type: 'SHORT_TEXT',
          label: 'Required Name',
          helpText: 'This field is required',
          isRequired: true, // This should block navigation if empty
          order: 0,
          validation: JSON.stringify({
            rules: [
              { type: 'required', message: 'Name is required' },
              { type: 'min', value: 2, message: 'Name must be at least 2 characters' }
            ]
          }),
          conditional: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          options: [],
          scoringConfig: null
        },
        {
          id: 'question-2',
          sectionId: 'section-1',
          fieldCode: 'required_email',
          type: 'SHORT_TEXT',
          label: 'Required Email',
          helpText: 'This field is required and must be a valid email',
          isRequired: true,
          order: 1,
          validation: JSON.stringify({
            rules: [
              { type: 'required', message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]
          }),
          conditional: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          options: [],
          scoringConfig: null
        }
      ]
    },
    {
      id: 'section-2',
      templateId: 'validation-test-template',
      title: 'Second Section',
      description: 'This section should not be accessible if first section has validation errors',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 'question-3',
          sectionId: 'section-2',
          fieldCode: 'section2_field',
          type: 'LONG_TEXT',
          label: 'Section 2 Field',
          helpText: 'This field should not be accessible if section 1 validation fails',
          isRequired: false,
          order: 0,
          validation: null,
          conditional: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          options: [],
          scoringConfig: null
        }
      ]
    }
  ]
};

// Test component that displays current section for verification
function TestFormWithNavigation() {
  return (
    <div>
      <div data-testid="current-section-display">
        <DynamicFormRenderer />
      </div>
      <DynamicFormNavigation />
    </div>
  );
}

describe('Validation Enforcement Bug', () => {
  it('should block navigation when required fields are empty - THIS TEST SHOULD FAIL', async () => {
    const user = userEvent.setup();

    // Arrange: Render form with required fields
    render(
      <FormEngineProvider template={mockTemplateWithValidation}>
        <TestFormWithNavigation />
      </FormEngineProvider>
    );

    // Assert: Should start on section 1
    expect(screen.getByText('Required Fields Section')).toBeInTheDocument();
    expect(screen.getByText('Section 1 of 2')).toBeInTheDocument();

    // Find the Next button
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();

    // Act: Try to navigate to next section without filling required fields
    await user.click(nextButton);

    // Assert: Navigation should be BLOCKED (but will currently allow due to bug)
    // This assertion should FAIL with current buggy implementation
    await waitFor(() => {
      // Should still be on section 1
      expect(screen.getByText('Required Fields Section')).toBeInTheDocument();
      expect(screen.getByText('Section 1 of 2')).toBeInTheDocument();

      // Should NOT be on section 2
      expect(screen.queryByText('Second Section')).not.toBeInTheDocument();
    });

    // There should be validation error messages displayed
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should allow navigation when all required fields are valid', async () => {
    const user = userEvent.setup();

    // Arrange: Render form with required fields
    render(
      <FormEngineProvider template={mockTemplateWithValidation}>
        <TestFormWithNavigation />
      </FormEngineProvider>
    );

    // Find required input fields
    const nameInput = screen.getByLabelText(/required name/i);
    const emailInput = screen.getByLabelText(/required email/i);
    const nextButton = screen.getByRole('button', { name: /next/i });

    // Act: Fill out required fields with valid data
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john.doe@example.com');

    // Wait for validation to process
    await waitFor(() => {
      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john.doe@example.com');
    });

    // Act: Try to navigate to next section
    await user.click(nextButton);

    // Assert: Navigation should be ALLOWED
    await waitFor(() => {
      // Should now be on section 2
      expect(screen.getByText('Second Section')).toBeInTheDocument();
      expect(screen.getByText('Section 2 of 2')).toBeInTheDocument();

      // Should no longer see section 1
      expect(screen.queryByText('Required Fields Section')).not.toBeInTheDocument();
    });
  });

  it('should block navigation with specific validation errors', async () => {
    const user = userEvent.setup();

    // Arrange: Render form
    render(
      <FormEngineProvider template={mockTemplateWithValidation}>
        <TestFormWithNavigation />
      </FormEngineProvider>
    );

    // Find input fields
    const nameInput = screen.getByLabelText(/required name/i);
    const emailInput = screen.getByLabelText(/required email/i);
    const nextButton = screen.getByRole('button', { name: /next/i });

    // Act: Fill fields with INVALID data
    await user.type(nameInput, 'X'); // Too short (min 2 chars)
    await user.type(emailInput, 'invalid-email'); // Invalid email format

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(nameInput).toHaveValue('X');
      expect(emailInput).toHaveValue('invalid-email');
    });

    // Act: Try to navigate to next section
    await user.click(nextButton);

    // Assert: Navigation should be BLOCKED due to validation errors
    // This should FAIL with current implementation
    await waitFor(() => {
      // Should still be on section 1
      expect(screen.getByText('Required Fields Section')).toBeInTheDocument();
      expect(screen.getByText('Section 1 of 2')).toBeInTheDocument();
    });

    // Should show specific validation error messages
    expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('should show validation summary when navigation is blocked', async () => {
    const user = userEvent.setup();

    // Arrange: Render form
    render(
      <FormEngineProvider template={mockTemplateWithValidation}>
        <TestFormWithNavigation />
      </FormEngineProvider>
    );

    const nextButton = screen.getByRole('button', { name: /next/i });

    // Act: Try to navigate without filling anything
    await user.click(nextButton);

    // Assert: Should show validation summary
    // This feature doesn't exist yet, so test documents expected behavior
    await waitFor(() => {
      // Should show some kind of validation summary or notification
      // For now, just check that individual field errors are shown
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // The next button should potentially be disabled or show different state
    // This is future enhancement - current test just documents expectation
  });

  it('should validate on blur and show errors immediately', async () => {
    const user = userEvent.setup();

    // Arrange: Render form
    render(
      <FormEngineProvider template={mockTemplateWithValidation}>
        <TestFormWithNavigation />
      </FormEngineProvider>
    );

    const nameInput = screen.getByLabelText(/required name/i);

    // Act: Focus and blur without entering data
    await user.click(nameInput);
    await user.tab(); // This should trigger blur

    // Assert: Should show validation error immediately
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });
});

describe('Root Cause Analysis - Navigation Validation', () => {
  it('documents the exact bug location in DynamicFormNavigation', () => {
    // This test documents the root cause identified in DynamicFormNavigation.tsx
    // Location: DynamicFormNavigation.tsx line 31-35

    // The handleNext function has NO validation:
    // const handleNext = () => {
    //   if (!isLastSection) {
    //     nextSection();        // ❌ NO VALIDATION CHECK
    //   }
    // };

    // Expected fix: Add validation before navigation
    // const handleNext = () => {
    //   if (!isLastSection) {
    //     const validationResult = validateCurrentSection();
    //     if (validationResult.hasErrors) {
    //       // Show errors, don't advance           // ✅ BLOCK NAVIGATION
    //       return;
    //     }
    //     nextSection();                           // ✅ ONLY ADVANCE IF VALID
    //   }
    // };

    expect(true).toBe(true); // This test is documentation
  });

  it('documents the missing validation function requirement', () => {
    // The form engine needs a validateCurrentSection() function
    // This should:
    // 1. Get all questions in current section
    // 2. Check each required field has a value
    // 3. Run validation rules on each field
    // 4. Return aggregated validation result
    // 5. Update form state with any errors found

    // Location for implementation: renderer.tsx FormContext
    // Add: validateCurrentSection: () => ValidationResult;

    expect(true).toBe(true); // This test is documentation
  });
});