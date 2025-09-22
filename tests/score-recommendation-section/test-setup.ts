/**
 * Test Setup for ScoreRecommendationSection Tests
 *
 * This file configures the testing environment with proper matchers,
 * mocks, and utilities needed for functional testing.
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Custom Jest matchers for improved testing
expect.extend({
  toHaveValidScore(received: string) {
    const score = parseFloat(received);
    const pass = !isNaN(score) && score >= 0 && score <= 3;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid score (0-3)`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid score (0-3), but got invalid value`,
        pass: false,
      };
    }
  },

  toHaveValidWeightedScore(received: string, originalScore: number, weight: number) {
    const calculatedScore = parseFloat(received);
    const expectedScore = parseFloat((originalScore * weight).toFixed(2));
    const pass = Math.abs(calculatedScore - expectedScore) < 0.01;

    if (pass) {
      return {
        message: () => `expected ${received} not to equal weighted score of ${expectedScore}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to equal weighted score of ${expectedScore} (${originalScore} * ${weight})`,
        pass: false,
      };
    }
  },
});

// Extend Jest types for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidScore(): R;
      toHaveValidWeightedScore(originalScore: number, weight: number): R;
    }
  }
}

// Suppress console warnings in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});