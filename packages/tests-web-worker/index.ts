import {tap} from 'rxjs/operators';
import {ExchangeFactory} from './src/exchanges/exchange.factory';

ExchangeFactory.get('01').then(exchange => {

  console.log(`--> start ${exchange.name}`,)

  exchange.mainSide.send({hello: 'world123'})

  exchange.mainSide.in$.pipe(
    tap(data => {
      console.log(`main process`, data)
    }),
  ).subscribe();

  setTimeout(() => {
    exchange.stop();
    console.log(`=== ${exchange.name} stopped`,)
  }, 4000)

});
