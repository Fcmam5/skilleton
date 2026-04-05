const tseslint = require('typescript-eslint');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'coverage/**', 'package-lock.json', '**/*.json'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['eslint.config.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
