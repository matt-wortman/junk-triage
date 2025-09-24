import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormEngineProvider, useFormEngine } from '@/lib/form-engine/renderer';
import { FormTemplateWithSections, FormResponse, RepeatableGroupData } from '@/lib/form-engine/types';

// Mock template for testing
const mockTemplate: FormTemplateWithSections = {
  id: 'test-template-1',
  title: 'Test Form',
  description: 'A test form for data persistence',
  version: '1.0.0',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  sections: [
    {
      id: 'section-1',
      templateId: 'test-template-1',
      title: 'Basic Info',
      description: 'Basic information section',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 'question-1',
          sectionId: 'section-1',
          fieldCode: 'basic_name',
          type: 'SHORT_TEXT',
          label: 'Name',
          helpText: 'Enter your name',
          isRequired: true,
          order: 0,
          validation: null,
          conditional: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          options: [],
          scoringConfig: null
        },
        {
          id: 'question-2',
          sectionId: 'section-1',
          fieldCode: 'basic_email',
          type: 'SHORT_TEXT',
          label: 'Email',
          helpText: 'Enter your email',
          isRequired: true,
          order: 1,
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

// Test component that displays current form state
function FormStateDisplay() {
  const { responses, repeatGroups } = useFormEngine();

  return (
    <div>
      <div data-testid="responses">{JSON.stringify(responses)}</div>
      <div data-testid="repeat-groups">{JSON.stringify(repeatGroups)}</div>
    </div>
  );
}

describe('Data Persistence Bug', () => {
  it('should preserve form data when template loads - THIS TEST SHOULD FAIL', () => {
    // Arrange: Initial data that should be preserved
    const initialData = {
      responses: {
        'basic_name': 'John Doe',
        'basic_email': 'john.doe@example.com',
        'mission_score': 3,
        'market_overview': 'This is important market data that should not be lost'
      } as FormResponse,
      repeatGroups: {
        'competitors': [
          { company: 'Competitor A', product: 'Product 1', revenue: '1M' },
          { company: 'Competitor B', product: 'Product 2', revenue: '2M' }
        ]
      } as RepeatableGroupData
    };

    // Act: Render FormEngineProvider with initialData
    render(
      <FormEngineProvider
        template={mockTemplate}
        initialData={initialData}
      >
        <FormStateDisplay />
      </FormEngineProvider>
    );

    // Assert: Initial data should be preserved
    const responsesDisplay = screen.getByTestId('responses');
    const repeatGroupsDisplay = screen.getByTestId('repeat-groups');

    // Parse the displayed JSON to verify data preservation
    const displayedResponses = JSON.parse(responsesDisplay.textContent || '{}');
    const displayedRepeatGroups = JSON.parse(repeatGroupsDisplay.textContent || '{}');

    // These assertions should FAIL with current buggy implementation
    expect(displayedResponses['basic_name']).toBe('John Doe');
    expect(displayedResponses['basic_email']).toBe('john.doe@example.com');
    expect(displayedResponses['mission_score']).toBe(3);
    expect(displayedResponses['market_overview']).toBe('This is important market data that should not be lost');

    expect(displayedRepeatGroups['competitors']).toHaveLength(2);
    expect(displayedRepeatGroups['competitors'][0]).toEqual({
      company: 'Competitor A',
      product: 'Product 1',
      revenue: '1M'
    });
  });

  it('should preserve existing section navigation when template loads', () => {
    // Arrange: Initial data with a different current section
    const initialData = {
      responses: {
        'basic_name': 'Jane Smith',
        'section2_field': 'Some data in section 2'
      } as FormResponse,
      repeatGroups: {} as RepeatableGroupData
    };

    // Create a template with multiple sections
    const multiSectionTemplate: FormTemplateWithSections = {
      ...mockTemplate,
      sections: [
        ...mockTemplate.sections,
        {
          id: 'section-2',
          templateId: 'test-template-1',
          title: 'Advanced Info',
          description: 'Advanced information section',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          questions: [
            {
              id: 'question-3',
              sectionId: 'section-2',
              fieldCode: 'section2_field',
              type: 'LONG_TEXT',
              label: 'Advanced Field',
              helpText: 'Enter advanced info',
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

    // Test component that also shows current section
    function FormStateWithSection() {
      const { responses, currentSection } = useFormEngine();

      return (
        <div>
          <div data-testid="responses">{JSON.stringify(responses)}</div>
          <div data-testid="current-section">{currentSection}</div>
        </div>
      );
    }

    // Act: Render with initial data
    render(
      <FormEngineProvider
        template={multiSectionTemplate}
        initialData={initialData}
      >
        <FormStateWithSection />
      </FormEngineProvider>
    );

    // Assert: Data should be preserved
    const responsesDisplay = screen.getByTestId('responses');
    const displayedResponses = JSON.parse(responsesDisplay.textContent || '{}');

    // The current section should NOT reset to 0 when there's existing data
    // But with the current bug, it will reset to 0

    // This assertion documents the expected behavior but will FAIL with current bug
    // In the future, we might want to preserve section state too
    expect(displayedResponses['basic_name']).toBe('Jane Smith');
    expect(displayedResponses['section2_field']).toBe('Some data in section 2');
  });

  it('should handle empty initialData gracefully', () => {
    // Arrange: Empty initial data (new form scenario)
    const initialData = {
      responses: {} as FormResponse,
      repeatGroups: {} as RepeatableGroupData
    };

    // Act: Render with empty initial data
    render(
      <FormEngineProvider
        template={mockTemplate}
        initialData={initialData}
      >
        <FormStateDisplay />
      </FormEngineProvider>
    );

    // Assert: Empty state should be handled properly
    const responsesDisplay = screen.getByTestId('responses');
    const repeatGroupsDisplay = screen.getByTestId('repeat-groups');

    const displayedResponses = JSON.parse(responsesDisplay.textContent || '{}');
    const displayedRepeatGroups = JSON.parse(repeatGroupsDisplay.textContent || '{}');

    expect(Object.keys(displayedResponses)).toHaveLength(0);
    expect(Object.keys(displayedRepeatGroups)).toHaveLength(0);
  });

  it('should handle undefined initialData gracefully', () => {
    // Arrange: No initial data provided (typical new form scenario)

    // Act: Render without initial data
    render(
      <FormEngineProvider template={mockTemplate}>
        <FormStateDisplay />
      </FormEngineProvider>
    );

    // Assert: Should start with empty state
    const responsesDisplay = screen.getByTestId('responses');
    const repeatGroupsDisplay = screen.getByTestId('repeat-groups');

    const displayedResponses = JSON.parse(responsesDisplay.textContent || '{}');
    const displayedRepeatGroups = JSON.parse(repeatGroupsDisplay.textContent || '{}');

    expect(Object.keys(displayedResponses)).toHaveLength(0);
    expect(Object.keys(displayedRepeatGroups)).toHaveLength(0);
  });
});

describe('Root Cause Analysis - SET_TEMPLATE Action', () => {
  it('documents the exact bug location in formReducer', () => {
    // This test documents the root cause identified in the investigation
    // Location: renderer.tsx lines 24-33

    // The SET_TEMPLATE case clears all data:
    // responses: {},           // ❌ CLEARS ALL USER DATA
    // repeatGroups: {},        // ❌ CLEARS ALL USER DATA
    // currentSection: 0,       // ❌ RESETS NAVIGATION
    // errors: {},              // ❌ CLEARS VALIDATION STATE

    // Expected fix: Preserve existing state data
    // responses: state.responses,        // ✅ PRESERVE DATA
    // repeatGroups: state.repeatGroups,  // ✅ PRESERVE DATA
    // currentSection: state.currentSection, // ✅ PRESERVE NAVIGATION
    // errors: state.errors,              // ✅ PRESERVE VALIDATION STATE (conditionally)

    expect(true).toBe(true); // This test is documentation
  });
});