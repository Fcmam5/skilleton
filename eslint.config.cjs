module.exports = [
  {
    ignores: ['dist/**', 'package-lock.json', '**/*.json'],
  },
  {
    files: ['**/*.ts'],
    plugins: { '@typescript-eslint': require('typescript-eslint') },
    languageOptions: {
      globals: require('globals').node,
      parser: require('typescript-eslint').parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
