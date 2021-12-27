const { resolve } = require('path');
const root = resolve(__dirname);
const jestDynamoDbPreset = require('@shelf/jest-dynamodb/jest-preset');

module.exports = {
  rootDir: root,
  displayName: 'root-tests',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testEnvironment: 'node',
  clearMocks: true,
  preset: 'ts-jest',
  ...jestDynamoDbPreset,
  setupFiles: ['dotenv/config'],
};
