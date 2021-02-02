const HtmlWebpackPlugin = require('html-webpack-plugin')
const {HtmlWebpackSkipAssetsPlugin} = require('html-webpack-skip-assets-plugin');
const ChunkListByEntrypoint = require('./webpack/plugins/chunk-list-by-entrypoint');
const {join, resolve} = require('path')

const DIST = resolve(__dirname, 'dist')
const SRC = resolve(__dirname, 'src')

const workerFilePattern = 'worker_'
const workerEntrypoint01 = `${workerFilePattern}01`

module.exports = [
  {
    entry: {
      bundle: './index.ts',
      [`${workerEntrypoint01}`]: join(SRC, 'exchanges/01/worker-side-context'),
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
        template: join(SRC, 'assets/index.html'),
        favicon: join(SRC, 'assets/favicon.ico'),
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
