import {ContextSide, StructuredCloneConverter} from '@dwfe/test-workers-core'
import {DataHandlerMain} from './main-side/data-handler-main'

export class Exchange01 {
  private readonly worker: Worker;

  private mainSide: ContextSide;
  private handlerMain = new DataHandlerMain();
  private converterMain = new StructuredCloneConverter();

  constructor() {
    this.worker = new Worker('./worker-side-01.js')
    this.mainSide = new ContextSide(this.worker, 'main  ', this.converterMain, this.handlerMain)
  }

  start() {
    console.log(`-> run exchange 01`,)

    this.handlerMain.send({hello: 'world123'});

    setTimeout(() => {
      this.stop();
      console.log(`= exchange 01 stoppped`,)
    }, 4000)
  }

  stop() {
    this.mainSide.stop()
    this.worker.terminate()
  }

}
