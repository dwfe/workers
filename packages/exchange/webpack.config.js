const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const SRC_DIR = path.resolve(__dirname, 'src')
const DIST_DIR = path.resolve(__dirname, 'dist')


module.exports = {
  entry: path.join(SRC_DIR, 'index.ts'),
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
    ]
  },
  output: {
    path: DIST_DIR,
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: DIST_DIR
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(SRC_DIR, 'index.html')
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts']
  },
};
