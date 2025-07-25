const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  globalSetup: './jest.globalSetup.ts',
  globalTeardown: './jest.globalTeardown.ts',
  transform: {
    ...tsJestTransformCfg,
  },
};
