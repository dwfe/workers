import {Subject} from 'rxjs';
import {shareReplay} from 'rxjs/operators'
import {IHandler} from '../contract'

export abstract class BaseHandler<TSend = any, TWrite = any, TProcess = any> implements IHandler<TSend, TWrite, TProcess> {

  private sendSubj = new Subject<TWrite>();

  send(data: TSend): void {
    this.sendSubj.next(data as any as TWrite);
  }

  send$ = this.sendSubj.asObservable().pipe(
    shareReplay(1),
  );

  abstract process(data: TProcess);

}
