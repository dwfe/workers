import {DataHandler} from '@dwfe/web-worker';

export class DataHandlerWorker extends DataHandler {

  processing(data: any) {
    console.log(`worker processing`, data)
    this.send({...data, time: +new Date()})
  }

}
