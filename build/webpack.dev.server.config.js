const HtmlWebpackPlugin = require('html-webpack-plugin')
const OpenPack = require('openpack')
const baseConfig = require('./webpack.dev.config')

baseConfig.entry = './dev-site/index'
delete baseConfig.output.library
delete baseConfig.output.libraryTarget
baseConfig.plugins.push(
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: './dev-site/index.html'
  }),
  new OpenPack({ lan: true })
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

