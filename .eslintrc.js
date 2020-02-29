module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'standard',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
  ],
  rules: {
    semi: ['error', 'always'],
    'comma-dangle': ['error', {
      arrays: 'only-multiline',
      objects: 'only-multiline',
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
