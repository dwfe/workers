import {Exchange01} from './exchanges';

const workerFilePattern = 'worker_'
const workerEntrypoint01 = `${workerFilePattern}01`
const pathToChunkListJsonOnServer = './chunk_list_by_entrypoint.json'

Exchange01
  .buildWorker(workerEntrypoint01, workerFilePattern, pathToChunkListJsonOnServer)
  .then(worker => {
    const exchange = new Exchange01(worker)
    exchange.start()
  })
  .catch(e => console.error('Exchange01', e))
