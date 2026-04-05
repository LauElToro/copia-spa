const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testSequencer: '<rootDir>/jest.simple-sequencer.cjs',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^swiper/react$': '<rootDir>/src/__mocks__/swiper.js',
    '^swiper/modules$': '<rootDir>/src/__mocks__/swiper.js',
    '^swiper/css$': '<rootDir>/src/__mocks__/swiper.js',
    '^swiper/css/navigation$': '<rootDir>/src/__mocks__/swiper.js',
    '^swiper/css/pagination$': '<rootDir>/src/__mocks__/swiper.js',
    '^next/link$': '<rootDir>/src/__mocks__/next/link.tsx',
    '^next/navigation$': '<rootDir>/src/__mocks__/next/navigation.ts',
    '^next/image$': '<rootDir>/src/__mocks__/next/image.tsx',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(swiper|ssr-window|dom7)/)',
  ],
  // Configuración para evitar errores de permisos en macOS con Node.js v22
  maxWorkers: 1,
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: false,
}

module.exports = createJestConfig(customJestConfig) 