import {DataHandler} from '@dwfe/test-workers-core';

export class DataHandlerMain extends DataHandler {
  processing(data: any) {
    console.log(`main processing`, data)
  }

}
