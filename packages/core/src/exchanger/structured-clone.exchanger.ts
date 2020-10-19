import {IWorkerExchanger} from './contract';
import {IWorkerPostData} from '../worker';

export class StructuredCloneExchanger implements IWorkerExchanger {

  read(e: MessageEvent) {
    return e.data; // do nothing
  }

  write(data): IWorkerPostData {
    return {
      message: data, // do nothing
      transfer: []
    };
  }

}
