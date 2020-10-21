import {Subject} from 'rxjs';
import {shareReplay} from 'rxjs/operators'
import {IDataHandler} from '../contract'

export abstract class DataHandler<TProcess = any, TWrite = any> implements IDataHandler<TProcess, TWrite> {

  private sender = new Subject<TWrite>();

  abstract processing(data: TProcess);

  send(data: TWrite): void {
    this.sender.next(data);
  }

  send$ = this.sender.asObservable().pipe(
    shareReplay(1),
  );

}
