module.exports = {
  extends: ['lintly'],
  overrides: [
    // Disable rules that are defined in eslint-config-lintly's overrides
    {
      files: ['**/*.js'],
      rules: {
        'flowtype/require-parameter-type': [0],
        'flowtype/require-return-type': [0],
      },
    },
  ],
}
