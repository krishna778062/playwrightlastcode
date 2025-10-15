import type { Linter } from 'eslint';

// Import configurations
const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');

// Import plugins
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const playwright = require('eslint-plugin-playwright');
const unusedImports = require('eslint-plugin-unused-imports');

const config: Linter.Config[] = [
  // Global ignores
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
      '**/static-files/**',
      '**/*.test-data.ts',
      '**/*.env',
      '**/videos/**',
      '**/screenshots/**',
    ],
  },

  // Base configuration for all files
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ...js.configs.recommended,
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      // Test-friendly base rules
      'prefer-const': 'warn',
      'no-console': 'off', // Allow console.log for debugging
      'no-unused-vars': 'off',

      // Auto-fixable unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'off',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Import sorting
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^@?\\w'],
            ['^@(core|modules|chat|content|global-search|platforms)(/.*|$)'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
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
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Auto-fixable unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // TypeScript rules - relaxed for tests
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // CRITICAL: Catch missing awaits and promise issues
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error', // Ensure await is used with thenable values
      '@typescript-eslint/no-misused-promises': 'error', // Prevent misuse of promises

      // Additional helpful rules
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Use ?? instead of ||
      '@typescript-eslint/prefer-optional-chain': 'warn', // Use ?. instead of &&
      '@typescript-eslint/no-unnecessary-condition': 'warn', // Warn about unnecessary conditions
    },
  },

  // Playwright specific configuration - ESSENTIAL RULES ONLY
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    plugins: {
      playwright,
    },
    rules: {
      // ESSENTIAL Playwright rules (the ones that prevent real bugs)
      'playwright/missing-playwright-await': 'error', // Catch missing awaits
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/valid-expect': 'error',
      'playwright/no-restricted-matchers': 'warn',

      // Auto-fixable rules (helpful but not blocking)
      'playwright/prefer-lowercase-title': 'error',
      'playwright/prefer-to-be': 'error',
      'playwright/prefer-to-contain': 'error',
      'playwright/prefer-to-have-count': 'error',

      // Disable overly strict rules
      'playwright/no-wait-for-selector': 'off',
      'playwright/no-wait-for-navigation': 'off',
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-element-handle': 'off',
      'playwright/no-eval': 'off',
      'playwright/no-force-option': 'off',
      'playwright/max-nested-describe': 'warn',
      'playwright/no-nested-step': 'warn',
      'playwright/no-networkidle': 'off',
      'playwright/no-unsafe-references': 'off',
      'playwright/no-useless-await': 'off',
      'playwright/no-useless-not': 'off',
      'playwright/prefer-comparison-matcher': 'off',
      'playwright/prefer-native-locators': 'off',
      'playwright/prefer-to-have-length': 'off',
      'playwright/valid-describe-callback': 'error',
      'playwright/valid-expect-in-promise': 'error',
      'playwright/valid-title': 'off',
      'playwright/valid-test-tags': 'off',
      'playwright/expect-expect': 'off',
      'playwright/no-conditional-expect': 'off',
      'playwright/no-standalone-expect': 'off',
    },
  },

  // Prettier config (must be last)
  prettierConfig,
];

export default config;
