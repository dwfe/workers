const path = require('path')
const SRC_DIR = path.resolve(__dirname, 'src')
const DIST_DIR = path.resolve(__dirname, 'dist')

module.exports = {
  entry: path.join(SRC_DIR, 'worker-side-01/index.ts'),
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
    filename: 'worker-side-01.js',
    //libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
};
