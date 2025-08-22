module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'max-len': ['error', { code: 100 }],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    'new-cap': [
      'error',
      {
        capIsNewExceptions: ['Router'],
      },
    ],
  },
};
