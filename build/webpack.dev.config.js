const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const baseConfig = require('./webpack.base.config')

baseConfig.entry = './src/index'
baseConfig.output.filename = 'datagrid.js'
baseConfig.plugins.push(
  new ExtractTextPlugin('datagrid.css'),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"development"'
    }
  })
)

module.exports = baseConfig
