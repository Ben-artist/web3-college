module.exports = {
  testMatch: ['**/?(*.)(spec|test).ts?(x)'],
  // 这个配置项的作用是在每个测试文件执行之前，自动加载并执行 <rootDir>/tests/setupTests.ts 文件。
  // 通常用于全局初始化测试环境，比如引入一些测试库、设置全局变量、mock 一些 API 等。
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  rootDir: '',
  transform: {
    '.(ts|tsx)': '@swc/jest',
  },
  moduleNameMapper: {
    '^@utils(.*)$': '<rootDir>/src/utils$1',
  },
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  watchAll: false,
  collectCoverage: true,
  coverageDirectory: './docs/jest-coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
};
