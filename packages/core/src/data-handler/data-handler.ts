import {Subject} from 'rxjs';
import {IWorkerDataHandler} from './contract';

export abstract class DataHandler<TProcessData = any, TSendData = any> implements IWorkerDataHandler<TProcessData, TSendData> {

  private sendSubj = new Subject<TSendData>();

  abstract process(data: TProcessData);

  send(data: TSendData): void {
    this.sendSubj.next(data);
  }

  send$ = this.sendSubj.asObservable();

}
