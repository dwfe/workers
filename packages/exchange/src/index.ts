import {WorkerSide, StructuredCloneConverter} from '@dwfe/test-workers-core';
import {DataHandlerMain} from './worker';

console.log(`hello`,)
const worker = new Worker('./worker.js')
// const handler = new DataHandlerMain()
// const mainSide = new WorkerSide(new StructuredCloneConverter(), handler, worker)
// mainSide.run$.subscribe();
// handler.send({hello: 'world'})
