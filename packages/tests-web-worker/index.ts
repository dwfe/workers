import {Exchange01} from './src/exchanges';

const workerFilePattern = 'worker_'
const workerEntrypoint01 = `${workerFilePattern}01`
const pathToChunkListOnServer = './chunk_list_by_entrypoint.json'

Exchange01
  .buildWorker(pathToChunkListOnServer, workerEntrypoint01)
  .then(worker => {
    const exchange = new Exchange01(worker)
    exchange.start()
  })
  .catch(e => console.error('Exchange01', e))
