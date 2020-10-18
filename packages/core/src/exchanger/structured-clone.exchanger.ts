import {IWorkerExchanger} from './contract';
import {IWorkerPostData} from '../data-hadler';

export class StructuredCloneExchanger implements IWorkerExchanger {

  read(data) {
    return data;
  }

  write(data): IWorkerPostData {
    return data;
  }

}
