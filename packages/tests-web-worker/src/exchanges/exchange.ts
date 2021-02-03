import {ContextSide} from '@dwfe/web-worker';

export class Exchange {

  name: string;
  mainSide: ContextSide;

  constructor(public id: string,
              private converter,
              private worker: Worker) {
    this.name = `Exchange_${id}`;
    this.mainSide = new ContextSide(worker, 'main', converter)
    this.mainSide.setDebug(true);
  }

  stop() {
    this.mainSide.stop()
  }

}

