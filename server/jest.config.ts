import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.globalSetup.ts'],
  globalTeardown: './jest.globalTeardown.ts',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  roots: ['./test'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/test/**/*.test.ts', '**/test/**/*.test.tsx'],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true
};

export default config;
