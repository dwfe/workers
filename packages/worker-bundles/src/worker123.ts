import {StructuredCloneConverter, WorkerSide} from '@dwfe/test-workers-core';
import {DataHandlerWorker} from './worker-side';

const handler = new DataHandlerWorker()
const workerSide = new WorkerSide('worker', new StructuredCloneConverter(), handler, self)

setTimeout(() => {
  handler.send({from: 'worker 3000'})
}, 3000)

setTimeout(() => {
  handler.send({from: 'worker 5000'})
}, 5000)



