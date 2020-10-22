import {DataHandler} from '@dwfe/test-workers-core';

export class DataHandlerWorker extends DataHandler {

  processing(data: any) {
    console.log(`worker processing`, data)
    this.send({...data, time: +new Date()})
  }

}
