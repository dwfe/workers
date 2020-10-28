import {StructuredCloneConverter} from '@dwfe/test-workers-core'
import {DataHandlerMain} from './main-side-context/data-handler-main'
import {AbstractExchange} from '../abstract-exchange';

export class Exchange01 extends AbstractExchange {
  name = `"Exchange01"`;

  constructor(protected worker: Worker,
              protected converterMain = new StructuredCloneConverter(),
              protected handlerMain = new DataHandlerMain()) {
    super(worker, converterMain, handlerMain);
  }

  start() {
    console.log(`--> start ${this.name}`,)

    this.handlerMain.send({hello: 'world123'})

    setTimeout(() => {
      this.stop();
      console.log(`=== ${this.name} stopped`,)
    }, 4000)
  }


}
