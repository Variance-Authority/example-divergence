import { defineConfig } from 'vitest/config';

export default defineConfig({
  // This example ships no tsconfig, so nothing else tells the transform which
  // JSX runtime to use. A real project already compiles JSX and needs neither
  // this line nor `react` in scope.
  esbuild: { jsx: 'automatic' },

  test: {
    include: ['test/**/*.test.jsx'],
    globalSetup: ['variance/reset.mjs'],
  },
});
