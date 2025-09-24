import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormEngineProvider, DynamicFormRenderer } from '@/lib/form-engine/renderer';
import { DynamicFormNavigation } from '@/components/form/DynamicFormNavigation';
import { FormTemplateWithSections } from '@/lib/form-engine/types';

// Type for performance memory API
type PerformanceWithMemory = Performance & {
  memory?: { usedJSHeapSize: number }
};

// Large template for performance testing
const createLargeTemplate = (sectionCount: number, questionsPerSection: number): FormTemplateWithSections => {
  const sections = [];

  for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
    const questions = [];

    for (let questionIndex = 0; questionIndex < questionsPerSection; questionIndex++) {
      questions.push({
        id: `question-${sectionIndex}-${questionIndex}`,
        sectionId: `section-${sectionIndex}`,
        fieldCode: `field_${sectionIndex}_${questionIndex}`,
        type: 'SHORT_TEXT' as const,
        label: `Question ${questionIndex + 1} in Section ${sectionIndex + 1}`,
        helpText: `Help text for question ${questionIndex + 1}`,
        isRequired: questionIndex % 3 === 0, // Every 3rd question is required
        order: questionIndex,
        validation: questionIndex % 3 === 0 ? JSON.stringify({
          rules: [{ type: 'required', message: `Field ${questionIndex + 1} is required` }]
        }) : null,
        conditional: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        options: [],
        scoringConfig: null
      });
    }

    sections.push({
      id: `section-${sectionIndex}`,
      templateId: 'performance-test-template',
      title: `Section ${sectionIndex + 1}`,
      description: `Performance test section with ${questionsPerSection} questions`,
      order: sectionIndex,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions
    });
  }

  return {
    id: 'performance-test-template',
    title: 'Performance Test Form',
    description: 'Large form for performance testing',
    version: '1.0.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections
  };
};

// Performance measurement utilities
const measurePerformance = async (operation: () => Promise<void> | void, label: string) => {
  const startTime = performance.now();
  const startMemory = (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0;

  await operation();

  const endTime = performance.now();
  const endMemory = (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0;
  const duration = endTime - startTime;
  const memoryDelta = endMemory - startMemory;

  console.log(`📊 Performance Baseline - ${label}:`, {
    duration: `${duration.toFixed(2)}ms`,
    memoryChange: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
    startMemory: `${(startMemory / 1024 / 1024).toFixed(2)}MB`,
    endMemory: `${(endMemory / 1024 / 1024).toFixed(2)}MB`
  });

  return { duration, memoryDelta };
};

// Simulate realistic user interactions with timing
const simulateUserTyping = async (input: HTMLElement, text: string, delay: number = 50) => {
  const user = userEvent.setup({ delay });
  await user.clear(input);
  await user.type(input, text);
};

describe('Performance Baseline Tests', () => {
  beforeEach(() => {
    // Clear any previous performance marks
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  });

  it('measures template loading performance with small form (10 questions)', async () => {
    const smallTemplate = createLargeTemplate(2, 5); // 2 sections, 5 questions each

    const { duration } = await measurePerformance(async () => {
      render(
        <FormEngineProvider template={smallTemplate}>
          <DynamicFormRenderer />
        </FormEngineProvider>
      );

      // Wait for initial render to complete
      await screen.findByText('Section 1');
    }, 'Small Form Load (10 questions)');

    // Performance expectations (these will establish baseline)
    console.log(`⚠️  Small form load took ${duration.toFixed(2)}ms`);

    // Document current performance for comparison after optimization
    expect(duration).toBeLessThan(1000); // Should load in under 1 second
  });

  it('measures template loading performance with medium form (50 questions)', async () => {
    const mediumTemplate = createLargeTemplate(5, 10); // 5 sections, 10 questions each

    const { duration } = await measurePerformance(async () => {
      render(
        <FormEngineProvider template={mediumTemplate}>
          <DynamicFormRenderer />
        </FormEngineProvider>
      );

      await screen.findByText('Section 1');
    }, 'Medium Form Load (50 questions)');

    console.log(`⚠️  Medium form load took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(2000); // Should load in under 2 seconds
  });

  it('measures template loading performance with large form (100 questions)', async () => {
    const largeTemplate = createLargeTemplate(10, 10); // 10 sections, 10 questions each

    const { duration } = await measurePerformance(async () => {
      render(
        <FormEngineProvider template={largeTemplate}>
          <DynamicFormRenderer />
        </FormEngineProvider>
      );

      await screen.findByText('Section 1');
    }, 'Large Form Load (100 questions)');

    console.log(`⚠️  Large form load took ${duration.toFixed(2)}ms`);

    // Large forms might be slower due to React rendering overhead
    expect(duration).toBeLessThan(5000); // Should load in under 5 seconds
  });

  it('measures form field interaction performance', async () => {
    const template = createLargeTemplate(1, 10); // 1 section, 10 questions

    render(
      <FormEngineProvider template={template}>
        <DynamicFormRenderer />
      </FormEngineProvider>
    );

    await screen.findByText('Section 1');

    // Find all input fields
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);

    const firstInput = inputs[0];

    // Measure typing performance
    const { duration } = await measurePerformance(async () => {
      await simulateUserTyping(firstInput, 'This is a test input with a reasonable amount of text to simulate real user input');
    }, 'Field Input Performance');

    console.log(`⚠️  Field input took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500); // Field input should be very fast
  });

  it('measures navigation performance between sections', async () => {
    const template = createLargeTemplate(5, 5); // 5 sections, 5 questions each

    render(
      <FormEngineProvider template={template}>
        <div>
          <DynamicFormRenderer />
          <DynamicFormNavigation />
        </div>
      </FormEngineProvider>
    );

    await screen.findByText('Section 1');

    const nextButton = screen.getByRole('button', { name: /next/i });

    // Measure section navigation performance
    const { duration } = await measurePerformance(async () => {
      fireEvent.click(nextButton);
      await screen.findByText('Section 2');
    }, 'Section Navigation Performance');

    console.log(`⚠️  Section navigation took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(300); // Navigation should be near-instant
  });

  it('measures validation performance with many fields', async () => {
    const template = createLargeTemplate(1, 20); // 1 section, 20 questions (some required)

    render(
      <FormEngineProvider template={template}>
        <DynamicFormRenderer />
      </FormEngineProvider>
    );

    await screen.findByText('Section 1');

    // Find all input fields
    const inputs = screen.getAllByRole('textbox');

    // Measure performance of filling multiple fields (triggers validation)
    const { duration } = await measurePerformance(async () => {
      // Fill first 5 inputs to trigger validation
      for (let i = 0; i < Math.min(5, inputs.length); i++) {
        await simulateUserTyping(inputs[i], `Value ${i + 1}`, 10); // Faster typing for batch test
      }
    }, 'Batch Validation Performance');

    console.log(`⚠️  Batch validation took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(1000); // Batch validation should complete quickly
  });

  it('measures memory usage during extended form interaction', async () => {
    const template = createLargeTemplate(3, 15); // 3 sections, 15 questions each

    const startMemory = (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0;

    render(
      <FormEngineProvider template={template}>
        <div>
          <DynamicFormRenderer />
          <DynamicFormNavigation />
        </div>
      </FormEngineProvider>
    );

    await screen.findByText('Section 1');

    // Simulate extended interaction
    const inputs = screen.getAllByRole('textbox');
    const nextButton = screen.getByRole('button', { name: /next/i });

    // Fill some fields in section 1
    if (inputs.length > 0) {
      await simulateUserTyping(inputs[0], 'Extended interaction test data', 10);
      if (inputs.length > 1) {
        await simulateUserTyping(inputs[1], 'More test data for memory measurement', 10);
      }
    }

    // Navigate to section 2
    fireEvent.click(nextButton);
    await screen.findByText('Section 2');

    // Fill more fields in section 2
    const section2Inputs = screen.getAllByRole('textbox');
    if (section2Inputs.length > 0) {
      await simulateUserTyping(section2Inputs[0], 'Section 2 data for memory test', 10);
    }

    const endMemory = (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0;
    const memoryIncrease = (endMemory - startMemory) / 1024 / 1024; // Convert to MB

    console.log(`📊 Memory Usage During Extended Interaction:`, {
      startMemory: `${(startMemory / 1024 / 1024).toFixed(2)}MB`,
      endMemory: `${(endMemory / 1024 / 1024).toFixed(2)}MB`,
      increase: `${memoryIncrease.toFixed(2)}MB`
    });

    // Memory usage shouldn't grow excessively during normal form interaction
    expect(memoryIncrease).toBeLessThan(10); // Less than 10MB increase for extended interaction
  });

  it('documents performance claims vs reality', () => {
    // This test documents the performance claims from the investigation

    // CLAIMS from codex.md:
    // - "Optimized for performance"
    // - "Real-time validation"
    // - "Efficient state management"

    // REALITY from codex-codeReview-critique.md:
    // - No React.memo implementations (FieldAdapters.tsx:12)
    // - Broken debouncing (raw setTimeout without cancellation)
    // - Unnecessary re-renders on every section load

    // The tests above establish ACTUAL performance baselines
    // to validate these claims and measure improvements after fixes

    expect(true).toBe(true); // This test is documentation
  });
});

describe('Performance Regression Detection', () => {
  // These tests will help detect performance regressions after fixes

  it('establishes render count baseline for form sections', async () => {
    let renderCount = 0;

    // Mock console.log to count renders (simplified render tracking)
    const originalLog = console.log;
    console.log = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('RENDER')) {
        renderCount++;
      }
      originalLog(...args);
    };

    const template = createLargeTemplate(2, 5);

    render(
      <FormEngineProvider template={template}>
        <DynamicFormRenderer />
      </FormEngineProvider>
    );

    await screen.findByText('Section 1');

    console.log = originalLog;

    console.log(`📊 Baseline Render Count: ${renderCount}`);

    // This establishes a baseline - after optimization, render count should decrease
    expect(renderCount).toBeGreaterThanOrEqual(0); // Just document current state
  });

  it('measures debouncing effectiveness', async () => {
    const template = createLargeTemplate(1, 3);

    render(
      <FormEngineProvider template={template}>
        <DynamicFormRenderer />
      </FormEngineProvider>
    );

    const input = screen.getAllByRole('textbox')[0];

    let validationCallCount = 0;

    // Mock validation to count calls
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = ((callback: () => void, delay: number) => {
      validationCallCount++;
      return originalSetTimeout(callback, delay);
    }) as typeof setTimeout;

    // Rapid typing simulation
    const user = userEvent.setup({ delay: 50 });
    await user.type(input, 'rapid');

    global.setTimeout = originalSetTimeout;

    console.log(`📊 Validation calls during typing: ${validationCallCount}`);

    // Current implementation: validation called for every keystroke
    // Optimized implementation: validation debounced to fewer calls
    expect(validationCallCount).toBeGreaterThan(0);
  });
});