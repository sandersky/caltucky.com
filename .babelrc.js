module.exports = {
  "plugins": [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "babel-plugin-auto-css-modules",
  ],
  "presets": [
    [
      "@babel/env",
      {
        "targets": {
          "browsers": [
            "last 2 versions",
            "ie 10",
          ],
        },
      },
    ],
    "@babel/flow",
    "@babel/react",
  ],
}
