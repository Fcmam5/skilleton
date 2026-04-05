const tseslint = require('typescript-eslint');
const globals = require('globals');
const security = require('eslint-plugin-security');

const FILESYSTEM_IMPORT_MESSAGE = 'Use FileSystem from src/core/filesystem.ts instead of importing node:fs directly.';

module.exports = [
  {
    ignores: ['dist/**', 'coverage/**', 'package-lock.json', '**/*.json'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      security,
    },
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      ...security.configs.recommended.rules,
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'node:fs',
              message: FILESYSTEM_IMPORT_MESSAGE,
            },
            {
              name: 'node:fs/promises',
              message: FILESYSTEM_IMPORT_MESSAGE,
            },
            {
              name: 'fs',
              message: FILESYSTEM_IMPORT_MESSAGE,
            },
            {
              name: 'fs/promises',
              message: FILESYSTEM_IMPORT_MESSAGE,
            },
          ],
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/core/filesystem.ts'],
    rules: {
      'no-restricted-imports': 'off',
      'security/detect-non-literal-fs-filename': 'off', // We expect controlled/validated inputs
    },
  },
  {
    files: ['eslint.config.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
