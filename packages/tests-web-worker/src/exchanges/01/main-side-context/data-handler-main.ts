import {DataHandler} from '@dwfe/web-worker';

export class DataHandlerMain extends DataHandler {
  processing(data: any) {
    console.log(`main processing`, data)
  }

}
