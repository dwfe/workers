const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs-extra')
const path = require('path')
const SRC_DIR = path.resolve(__dirname, 'src')
const DIST_DIR = path.resolve(__dirname, 'dist')


const filesOfWorkersFromToMap = new Map([
  ['../worker-side-bundles/dist/worker123.js', './dist/worker123.js']
])
const copyFilesOfWorkers = compiler => {
  console.log(`==========================\r\n Copying files of workers\r\n==========================`,)
  filesOfWorkersFromToMap.forEach((to, from) => {
    try {
      console.log(` > copy '${from}' -> '${to}'`,)
      fs.copySync(from, to)
    } catch (e) {
      console.error(e)
    }
    console.log(` > copy done!`,)
  })
  console.log(`==========================\r\n`,)
}


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
    {
      apply: compiler => {
        compiler.hooks.watchRun.tap('Copying files of workers', copyFilesOfWorkers)
      }
    },
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(SRC_DIR, 'index.html')
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts']
  },
};
