module.exports = {
  extends: [
    'next/core-web-vitals',
    '../../.eslintrc.js'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function'
      }
    ],
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
};