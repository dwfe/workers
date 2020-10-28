const path = require('path')
const common = require('./common')
const {SRC_DIR, DIST_DIR} = common.params

module.exports = {
  ...common.config,
  entry: path.join(SRC_DIR, 'exchange-01/worker-side/index.ts'),
  output: {
    path: DIST_DIR,
    filename: 'worker-side-01.js',
    //libraryTarget: 'umd'
  },
};
