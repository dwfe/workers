import {tap} from 'rxjs/operators';
import {ContextSide} from '@dwfe/web-worker';

import {SideFactory} from '../side.factory';


export class MainActions {

  static async of(id: string): Promise<MainActions> {
    const side = await SideFactory.get('main', id);
    return new MainActions(side);
  }

  constructor(private side: ContextSide) {
    side.received$.pipe(
      tap(data => {
        console.log(`main process received`, data)
      })
    ).subscribe();
  }

  run() {
    this.side.send({hello: 'world123'})

    setTimeout(() => {
      this.side.send({before: 'die'})
      this.side.stop();
    }, 4000)
  }

}
