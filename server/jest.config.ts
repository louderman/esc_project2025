import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',

  // run ONCE before all tests / ONCE after all tests
  globalSetup: '<rootDir>/jest.globalSetup.ts',
  globalTeardown: '<rootDir>/jest.globalTeardown.ts',
  roots: ['<rootDir>/test'],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],

  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }] },
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
};
export default config;

