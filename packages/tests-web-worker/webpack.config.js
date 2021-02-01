const HtmlWebpackPlugin = require('html-webpack-plugin')
const {HtmlWebpackSkipAssetsPlugin} = require('html-webpack-skip-assets-plugin');
const ChunkListByEntrypoint = require('./webpack/plugins/chunk-list-by-entrypoint')
const path = require('path')
const SRC = path.resolve(__dirname, 'src')
const DIST = path.resolve(__dirname, 'dist')

const workerFilePattern = 'worker_'
const workerEntrypoint01 = `${workerFilePattern}01`

module.exports = [
  {
    entry: {
      [`${workerEntrypoint01}`]: path.join(SRC, 'exchanges/01/worker-side-context/index.ts'),
      bundle: path.join(SRC, 'index.ts'),
    },
    output: {
      path: DIST,
      filename: '[name].[contenthash].js',
    },
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
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(SRC, 'assets/index.html'),
        favicon: path.join(SRC, 'assets/favicon.ico'),
        skipAssets: [`${workerFilePattern}*`]
      }),
      new HtmlWebpackSkipAssetsPlugin(),
      new ChunkListByEntrypoint(),
    ],
    optimization: {
      splitChunks: {
        // не режу на чанки модуль для воркера, т.к. webpack не умеет работать в ситуации:
        // new Worker(ИндексныйЧанк) + вендорный чанк, вот вендорный чанк он и не может корректно подгрузить
        // https://github.com/webpack/webpack/issues/6472
        chunks: chunk => !chunk.name.includes(workerFilePattern),
      }
    },
    resolve: {
      extensions: ['.js', '.ts']
    },
  }
]
