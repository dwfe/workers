import {ContextSide, StructuredCloneConverter} from '@dwfe/test-workers-core'
import {DataHandlerWorker} from './data-handler-worker'

const handler = new DataHandlerWorker()
const workerSide = new ContextSide(self, 'worker', new StructuredCloneConverter(), handler)

setTimeout(() => {
  handler.send({from: 'worker 3000'})
}, 3000)

setTimeout(() => {
  handler.send({from: 'worker 5000'})
}, 5000)
