import {Subject} from 'rxjs';
import {distinctUntilChanged, shareReplay} from 'rxjs/operators'
import {IWorkerDataHandler} from './contract';

export abstract class DataHandler<TProcess = any, TWrite = any> implements IWorkerDataHandler<TProcess, TWrite> {

  private sendSubj = new Subject<TWrite>();

  abstract processing(data: TProcess);

  send(data: TWrite): void {
    this.sendSubj.next(data);
  }

  send$ = this.sendSubj.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1),
  );

}
