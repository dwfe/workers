import {WorkerSide, StructuredCloneConverter} from '@dwfe/test-workers-core';
import {DataHandlerWorker} from './data-handler-worker';


const handler = new DataHandlerWorker()
const workerSide = new WorkerSide(new StructuredCloneConverter(), handler, self)
workerSide.run$.subscribe();

