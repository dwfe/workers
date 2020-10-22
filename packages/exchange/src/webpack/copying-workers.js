const fs = require('fs-extra')

const fromTo = new Map([
  ['../worker-bundles/dist/worker-side-01.js', './dist/worker-side-01.js']
])

function copyFilesOfWorkers() {
  console.log(`==========================\r\n Copying files of workers\r\n==========================`,)
  fromTo.forEach((to, from) => {
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

module.exports = copyFilesOfWorkers;
