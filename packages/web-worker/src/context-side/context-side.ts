import {fromEvent, merge, Observable, of, Subject} from 'rxjs'
import {catchError, map, mapTo, shareReplay, takeUntil, tap} from 'rxjs/operators'
import {ContextType, IConverter} from './contract';

export class ContextSide<TSend = any, TPost = any, TRead = any, TProcess = any> {

  private stopper = new Subject();
  private isDebug = false;

  private sendSubj = new Subject<TSend>();

  constructor(public readonly ctx: ContextType,
              public readonly name: string,
              public readonly converter: IConverter<TSend, TPost, TRead, TProcess>) {
    this.start$.subscribe();
  }

  send(data: TSend) {
    this.sendSubj.next(data);
  }

  private out$ = this.sendSubj.asObservable().pipe(
    tap(d => this.log('to converter.write', d)),
    map(d => this.converter.write(d)),         // TSend -> TPost
    tap(data => this.log('to postMessage', data)),
    tap(data => this.ctx.postMessage(data.message, data.transfer)),
  );

  in$: Observable<TProcess> = fromEvent<MessageEvent>(this.ctx, 'message').pipe(
    tap(event => this.log('to converter.read', event.data)),
    map(event => this.converter.read(event)),  // TRead -> TProcess
    tap(data => this.log('to process', data)),
    shareReplay(1),
  );

  private error$ = fromEvent<MessageEvent>(this.ctx, 'messageerror').pipe(
    tap(event => this.error('messageerror', event)),
  );

  private start$ = merge(
    this.out$,
    this.error$,
  ).pipe(
    takeUntil(this.stopper.asObservable()),
    catchError(err => of(this.error('composition error', err))),
    mapTo(null)
  );

  stop() {
    this.stopper.next(true);
    this.stopper.complete();
    if (this.ctx instanceof Worker) {
      (this.ctx as Worker).terminate();
    } else if (this.ctx instanceof DedicatedWorkerGlobalScope) {
      (this.ctx as DedicatedWorkerGlobalScope).close();
    }
  }

//region Support

  setDebug(value: boolean) {
    this.isDebug = value;
  }

  logPrefix = `ctx[${this.name}]:`;

  log(...args) {
    if (this.isDebug)
      console.log(this.logPrefix, ...args);
  }

  error(...args) {
    console.error(this.logPrefix, ...args);
  }

//endregion

}
