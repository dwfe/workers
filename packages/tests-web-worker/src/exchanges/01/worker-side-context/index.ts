import {ContextSide, StructuredCloneConverter} from '@dwfe/web-worker'
import {WorkerHandler} from './worker.handler'

const handler = new WorkerHandler()
const workerSide = new ContextSide(self, 'worker 01', new StructuredCloneConverter(), handler)
workerSide.setDebug(true);

setTimeout(() => {
  handler.send({from: 'worker 3000'})
}, 3000)

setTimeout(() => {
  handler.send({from: 'worker 5000'})
}, 5000)
