module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'standard'
  ],
  plugins: [
    '@typescript-eslint',
    'react'
  ],
  rules: {
    'semi': ['error', 'always'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Fixes JSX with Solid
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error'
  }
};
