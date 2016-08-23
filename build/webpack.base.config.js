const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')

module.exports = {
  output: {
    path: './dist',
    library: 'datagrid',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, '../src')
        ],
        loader: 'babel-loader'
      },
      {
        test: /\.(woff2?|ttf|png|svg|eot)$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader')
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader!sass-loader?sourceMap')
      }
    ]
  },
  postcss: function () {
    return [require('autoprefixer')]
  },
  vue: {
    loaders: {
      css: ExtractTextPlugin.extract('css-loader?sourceMap!postcss-loader'),
      scss: ExtractTextPlugin.extract('css-loader?sourceMap!postcss-loader!sass-loader?sourceMap')
    }
  },
  plugins: []
}

