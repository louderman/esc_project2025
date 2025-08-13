import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.globalSetup.ts'],
  globalTeardown: './jest.globalTeardown.ts',
  transform: {
    ...tsJestTransformCfg,
  },
  collectCoverage: true,
  coverageReporters: ['text', 'html'],

  // Instead of `roots`
  testMatch: [
    './**/*.test.ts',
    './**/*.integration.test.ts',
  ],

  // Optional: exclude dist tests
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/server/dist/'],
};

export default config;
