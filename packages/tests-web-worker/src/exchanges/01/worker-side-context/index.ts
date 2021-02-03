import {tap} from 'rxjs/operators'
import {ContextSide, StructuredCloneConverter} from '@dwfe/web-worker'

const workerSide = new ContextSide(self, 'worker 01', new StructuredCloneConverter())
workerSide.setDebug(true);

workerSide.in$.pipe(
  tap(data => workerSide.send({...data, time: +new Date()}))
).subscribe();

setTimeout(() => {
  workerSide.send({from: 'worker 3000'})
}, 3000)

setTimeout(() => {
  workerSide.send({from: 'worker 5000'})
}, 5000)
