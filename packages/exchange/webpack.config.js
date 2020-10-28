// const workerSidesConfig = require('./webpack/worker-sides.config')
// const runConfig = require('./webpack/run.config')
// module.exports = [
//   workerSidesConfig,
//   runConfig,
// ];

// const Manifest = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackSkipAssetsPlugin = require('html-webpack-skip-assets-plugin').HtmlWebpackSkipAssetsPlugin;
const path = require('path')
const SRC = path.resolve(__dirname, 'src')
const DIST = path.resolve(__dirname, 'dist')

module.exports = [
  // {
  //   entry: {
  //     exchange_01_worker_side: path.join(SRC, 'exchange-01/worker-side/index.ts'),
  //     bundle: path.join(SRC, 'index.ts'),
  //   },
  //   output: {
  //     path: DIST,
  //     filename: '[name].[contenthash].js',
  //   },
  //   devtool: 'inline-source-map',
  //   module: {
  //     rules: [
  //       {
  //         test: /\.ts$/,
  //         loader: 'ts-loader',
  //         exclude: /node_modules/
  //       },
  //     ]
  //   },
  //   plugins: [
  //   ],
  //   optimization:{
  //     splitChunks:{
  //       chunks: 'all'
  //     }
  //   },
  //   resolve: {
  //     extensions: ['.js', '.ts']
  //   },
  // },
  {
    entry: {
      exchange_01_worker_side: path.join(SRC, 'exchange-01/worker-side/index.ts'),
      bundle: path.join(SRC, 'index.ts'),
    },
    output: {
      globalObject: "this",
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
        template: path.join(SRC, 'index.html'),
        skipAssets: ['exchange_*js']
      }),
      new HtmlWebpackSkipAssetsPlugin(),
    ],
    // optimization:{
    //   splitChunks:{
    //     chunks: 'all'
    //   }
    // },
    resolve: {
      extensions: ['.js', '.ts']
    },
  }
]
