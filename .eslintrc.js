module.exports = {
  root: true,
  extends: [
    'google',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'require-jsdoc': 'off'
  },
  ignorePatterns: ['dist/', 'node_modules/', '.next/', 'coverage/', '**/*.js']
};