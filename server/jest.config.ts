import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  collectCoverage: true,
  coverageReporters: ['text', 'html'],

  // Run once before all tests
  globalSetup: '<rootDir>/jest.globalSetup.ts',

  // Run once after all tests
  globalTeardown: '<rootDir>/jest.globalTeardown.ts',

  // Per-test hooks file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Match test files inside /test directory (relative to server/)
  testMatch: [
    '<rootDir>/test/**/*.test.ts',
    '<rootDir>/test/**/*.spec.ts',
    '<rootDir>/test/**/*.integration.test.ts',
  ],

  // Ignore compiled files and node_modules
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/'],
};

export default config;
