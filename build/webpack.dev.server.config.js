const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const OpenPack = require('openpack')
const baseConfig = require('./webpack.dev.config')

baseConfig.entry = './dev-site/index'
delete baseConfig.output.library
delete baseConfig.output.libraryTarget
baseConfig.module.loaders[0].include.push(path.resolve(__dirname, '../dev-site'))
baseConfig.plugins.push(
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: './dev-site/index.html'
  }),
  new OpenPack()
)

baseConfig.devServer = {
  noInfo: true,
  host: '0.0.0.0',
  port: '13466',
  contentBase: './no-this-dir'
}

baseConfig.watch = true
baseConfig.devtool = '#source-map'

module.exports = baseConfig

