/** @type {import('jest').Config} */
module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      '@swc/jest',
      {
        jsc: { parser: { syntax: 'typescript', tsx: false }, target: 'es2022' },
      },
    ],
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!src/types.ts'],
  coverageProvider: 'v8',
};
