const workerSidesConfig = require('./webpack/worker-sides.config')
const runConfig = require('./webpack/run.config')

module.exports = [
  workerSidesConfig,
  runConfig,
];
