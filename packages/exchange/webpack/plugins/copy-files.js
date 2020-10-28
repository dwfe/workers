const fs = require('fs-extra')

const defaultOpt = {
  compilerHookName: 'watchRun', // https://webpack.js.org/api/compiler-hooks
  fromToMap: new Map([
    // ['../worker-bundles/dist/worker-side-01.js', './dist/worker-side-01.js']
  ])
}

module.exports = function ({compilerHookName, fromToMap} = defaultOpt) {
  this.apply = compiler => {
    compiler.hooks[compilerHookName].tap('Copy files', () => {
      {
        console.log(`==========================\r\n Copying files \r\n==========================`,)
        fromToMap.forEach((to, from) => {
          try {
            console.log(` > copy '${from}' -> '${to}'`,)
            fs.copySync(from, to)
            console.log(` > done!`,)
          } catch (e) {
            console.error(e)
          }
        })
        console.log(`==========================\r\n`,)
      }
    })
  }
}
