import {StructuredCloneConverter} from '@dwfe/web-worker'
import {AbstractExchange} from '../abstract-exchange';

export class Exchange01 extends AbstractExchange {
  name = 'Exchange01';

  constructor(protected worker: Worker,
              protected mainConverter = new StructuredCloneConverter()) {
    super(worker, mainConverter);
  }

  start() {
    console.log(`--> start ${this.name}`,)

    this.mainSide.send({hello: 'world123'})

    setTimeout(() => {
      this.stop();
      console.log(`=== ${this.name} stopped`,)
    }, 4000)
  }

}
