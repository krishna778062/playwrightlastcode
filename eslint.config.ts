import type { Linter } from 'eslint';

// Import configurations
const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');

// Import plugins
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

const config: Linter.Config[] = [
  // Global ignores first
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'test-results/**',
      'playwright-report/**',
      'coverage/**',
      '**/*.min.js',
      'convert-report.js',
      '**/static-files/**', // Ignore test data files
      '**/*.test-data.ts', // Ignore test data files
      '**/*.env', // Ignore environment files
    ],
  },

  // Base configuration for all files
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ...js.configs.recommended,
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Base rules - relaxed for test automation
      'prefer-const': 'warn', // Warn instead of error
      'no-console': 'off', // Allow console.log for debugging tests
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // Warn instead of error

      // Import sorting rules - keep these for clean code
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports
            ['^\\u0000'],
            // Node.js builtins and external libraries
            ['^@?\\w'],
            // Internal modules using path mapping
            ['^@(core|modules|chat|content|global-search|platforms)(/.*|$)'],
            // Parent imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Relative imports
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  // TypeScript specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Disable base rule in favor of TypeScript version
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // Warn instead of error

      // TypeScript specific rules - relaxed for test automation
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' in test automation
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // Warn instead of error
    },
  },

  // Prettier config (must be last to override conflicting rules)
  prettierConfig,
];

export default config;
