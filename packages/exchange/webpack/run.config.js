const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const common = require('./common')
const {SRC_DIR, DIST_DIR} = common.params

module.exports = {
  ...common.config,
  entry: path.join(SRC_DIR, 'index.ts'),
  output: {
    path: DIST_DIR,
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: DIST_DIR
  },
  plugins: [
    // {
    //   apply: compiler => {
    //     compiler.hooks.watchRun.tap('Copy files of workers', copyFilesOfWorkers)
    //   }
    // },
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(SRC_DIR, 'index.html')
    }),
  ],
};
