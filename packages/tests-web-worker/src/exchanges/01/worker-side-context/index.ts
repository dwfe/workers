import {tap} from 'rxjs/operators'
import {ContextSide, IConverter} from '@dwfe/web-worker'
import {registry} from '../../exchange.factory';

const converter = registry.get('01')?.workerConverter as IConverter;
const workerSide = new ContextSide(self, 'worker', converter);
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
