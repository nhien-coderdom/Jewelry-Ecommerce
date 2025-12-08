module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/api/**/*.js',
    '!src/api/**/routes/**',
    '!src/api/**/content-types/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }],
  },
};
