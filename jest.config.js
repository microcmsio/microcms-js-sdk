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
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/types.ts',
    '!src/typedSchema.ts',
  ],
  coverageProvider: 'babel',
  coverageReporters: ['text', 'html', 'lcovonly', 'json', 'json-summary'],
  coverageThreshold: {
    './src/**/*.ts': {
      statements: 98,
      branches: 90,
      functions: 100,
      lines: 98,
    },
  },
};
