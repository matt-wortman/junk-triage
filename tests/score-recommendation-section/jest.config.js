/**
 * Jest Configuration for ScoreRecommendationSection Tests
 *
 * This configuration ensures proper testing environment for React components
 * with TypeScript, Next.js, and Tailwind CSS support.
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  displayName: 'ScoreRecommendationSection Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/score-recommendation-section/test-setup.ts'],
  testMatch: [
    '<rootDir>/tests/score-recommendation-section/**/*.test.{js,jsx,ts,tsx}',
  ],
  moduleNameMapping: {
    // Handle module aliases (if using tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/components/form/ScoreRecommendationSection.tsx',
    'src/lib/scoring.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig);