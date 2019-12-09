module.exports = {
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'airbnb-typescript/base',
  ],
  plugins: [
    'import',
    'react',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': [
        '.ts',
        '.tsx',
      ],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
  },
};
