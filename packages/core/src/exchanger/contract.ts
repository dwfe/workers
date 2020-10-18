import {IWorkerPostData} from 'data-hadler';

export interface IWorkerExchanger {
  read(data: any): any;

  write(data: any): IWorkerPostData;
}
