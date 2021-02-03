const HtmlWebpackPlugin = require('html-webpack-plugin')
const {HtmlWebpackSkipAssetsPlugin} = require('html-webpack-skip-assets-plugin');
const ChunkListByEntrypoint = require('./webpack/plugins/chunk-list-by-entrypoint');
const {getWorkerEntries} = require('./webpack/worker-file.entries');
const {join, resolve} = require('path');

const DIST = resolve(__dirname, 'dist')
const SRC = resolve(__dirname, 'src')
const workerFilePattern = 'worker_'

module.exports = [
  {
    entry: {
      bundle: './index.ts',
      ...getWorkerEntries(SRC, workerFilePattern),
    },
    output: {
      path: DIST,
      filename: '[name].[contenthash].js',
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
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
        skipAssets: [`${workerFilePattern}*`] // не добавлять файлы воркеров в index.html
      }),
      new HtmlWebpackSkipAssetsPlugin(),
      new ChunkListByEntrypoint(),
    ],
    optimization: {
      splitChunks: {
        // не резать на чанки модуль для воркера, т.к. webpack не умеет работать в ситуации:
        // new Worker(ИндексныйЧанк) + вендорный чанк, вот вендорный чанк он и не может корректно подгрузить
        // https://github.com/webpack/webpack/issues/6472
        chunks: chunk => !chunk.name.includes(workerFilePattern),
      }
    },
    devtool: 'inline-source-map',
  }
]
