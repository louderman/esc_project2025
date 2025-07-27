const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.globalSetup.ts'],
  transform: {
    ...tsJestTransformCfg,
  },
};
