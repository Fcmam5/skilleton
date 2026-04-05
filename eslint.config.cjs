const tseslint = require('typescript-eslint');
const globals = require('globals');
const security = require('eslint-plugin-security');

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
