const path = require('path')

module.exports = {
  params: {
    SRC_DIR: path.resolve(__dirname, '../src'),
    DIST_DIR: path.resolve(__dirname, '../dist'),
  },
  config: {
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
    resolve: {
      extensions: ['.js', '.ts']
    },
  }
};
