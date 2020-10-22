import {Subject} from 'rxjs';
import {shareReplay} from 'rxjs/operators'
import {IDataHandler} from '../contract'

export abstract class DataHandler<TProcessing = any, TSend = any, TWrite = any> implements IDataHandler<TProcessing, TSend, TWrite> {

  private writeSource = new Subject<TWrite>();

  abstract processing(data: TProcessing);

  send(data: TSend): void {
    this.writeSource.next(data as any as TWrite);
  }

  write$ = this.writeSource.asObservable().pipe(
    shareReplay(1),
  );

}
