import {StructuredCloneConverter} from '@dwfe/web-worker'
import {MainHandler} from './main-side-context/main.handler'
import {AbstractExchange} from '../abstract-exchange';

export class Exchange01 extends AbstractExchange {
  name = 'Exchange01';

  constructor(protected worker: Worker,
              protected mainConverter = new StructuredCloneConverter(),
              protected mainHandler = new MainHandler()) {
    super(worker, mainConverter, mainHandler);
  }

  start() {
    console.log(`--> start ${this.name}`,)

    this.mainHandler.send({hello: 'world123'})

    setTimeout(() => {
      this.stop();
      console.log(`=== ${this.name} stopped`,)
    }, 4000)
  }

}
