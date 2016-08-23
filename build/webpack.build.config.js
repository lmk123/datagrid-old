const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const baseConfig = require('./webpack.base.config')

baseConfig.entry = './src/index'
baseConfig.output.filename = '[name].min.js'
baseConfig.plugins.push(
  new ExtractTextPlugin('[name].min.css'),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.DedupePlugin()
)

module.exports = baseConfig

