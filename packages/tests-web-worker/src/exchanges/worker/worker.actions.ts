import {tap} from 'rxjs/operators'
import {ContextSide} from '@dwfe/web-worker';
import {SideFactory} from '../side.factory';

export class WorkerActions {

  static async of(id: string): Promise<WorkerActions> {
    const side = await SideFactory.get('worker', id);
    return new WorkerActions(side);
  }

  constructor(private side: ContextSide) {
    side.received$.pipe(
      tap(data => {
        console.log(`worker process`, data)
        side.send({...data, time: new Date().toISOString()});
      })
    ).subscribe();
  }

  run() {
    setTimeout(() => {
      this.side.send({from: 'worker 3000'})
    }, 3000)

    setTimeout(() => {
      this.side.send({from: 'worker 5000'})
    }, 5000)
  }
}
