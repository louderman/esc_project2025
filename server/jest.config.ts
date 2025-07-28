const { createDefaultPreset } = require('ts-jest');

import type { Config } from 'jest';
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
  roots: ['./test'],
};

export default config;
