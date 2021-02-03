import {tap} from 'rxjs/operators';
import {exchanges, SideFactory} from './src/exchanges/side.factory';

Array.from(exchanges.keys()).forEach(async id => {
    const exchange = `Exchange_${id}`;
    console.log(`--> start ${exchange}`,)

    const side = await SideFactory.get('main', id);

    side.received$.pipe(
      tap(data => {
        console.log(`main process`, data)
      }),
    ).subscribe();

    side.send({hello: 'world123'})

    setTimeout(() => {
      side.send({before: 'die'})
      side.stop();
      console.log(`=== ${exchange} stopped`,)
    }, 4000)
  }
)
