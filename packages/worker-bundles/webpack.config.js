const path = require('path')
const SRC_DIR = path.resolve(__dirname, 'src')
const DIST_DIR = path.resolve(__dirname, 'dist')

module.exports = {
  entry: path.join(SRC_DIR, 'worker123.ts'),
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
    filename: 'worker123.js',
    //libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
};
