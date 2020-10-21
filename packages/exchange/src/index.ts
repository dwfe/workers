import {StructuredCloneConverter, WorkerSide} from '@dwfe/test-workers-core'
import {DataHandlerMain} from './worker-side'

const worker = new Worker('./worker123.js')

const handler = new DataHandlerMain()
const mainSide = new WorkerSide('main  ', new StructuredCloneConverter(), handler, worker)
handler.send({hello: 'world123'});

setTimeout(() => {
  mainSide.stop()
  // worker.terminate()
  console.log(`main side stoppped`,)
}, 4000)
