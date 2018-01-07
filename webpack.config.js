const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const PUBLIC_PATH = path.join(__dirname, 'public')

function getPlugins() {
  const plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: `"${process.env.NODE_ENV}"`,
      },
    }),
    new ExtractTextPlugin('styles.css'),
  ]

  if (IS_PRODUCTION) {
    plugins.push(
      new UglifyJSPlugin({
        extractComments: true,
        sourceMap: true,
      }),
    )
  }

  return plugins
}

module.exports = {
  devServer: {
    contentBase: PUBLIC_PATH,
    historyApiFallback: true,
    https: true,
  },
  devtool: 'source-map',
  entry: path.resolve('app', 'index.js'),
  module: {
    loaders: [
      {
        exclude: [/node_modules/],
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: IS_PRODUCTION,
                sourceMap: true,
              },
            },
            'postcss-loader',
          ],
        }),
      },
      {
        exclude: [/node_modules/],
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=assets/[hash].[ext]',
        ],
        test: /\.(gif|jpe?g|png|svg)$/,
      },
      {
        exclude: [/node_modules/],
        loaders: ['babel-loader'],
        test: /\.js$/,
      },
    ],
  },
  output: {
    path: PUBLIC_PATH,
    filename: 'bundle.js',
  },
  plugins: getPlugins(),
}
