module.exports = {
  extends: 'standard',
  globals: {
    describe: false,
    expect: false,
    fetch: false,
    it: false,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'flowtype',
    'react',
  ],
  rules: {
    // Configure built-in rules
    camelcase: 0, // disabling b/c Wordpress API uses underscores
    'comma-dangle': ['error', 'always-multiline'],

    // Configure eslint-plugin-flowtype
    // See: https://github.com/gajus/eslint-plugin-flowtype
    'flowtype/define-flow-type': 'error', // Don't complain about flow types

    // Configure eslint-plugin-react
    // See: https://github.com/yannickcr/eslint-plugin-react
    'react/jsx-uses-react': 'error', // Don't complain about React imports
    'react/jsx-uses-vars': 'error', // Don't complain about component imports
  },
}
