import {fromEvent, merge, Subject} from 'rxjs'
import {map, mapTo, takeUntil, tap} from 'rxjs/operators'
import {ContextType, IDataConverter, IDataHandler} from './contract';

export class ContextSide<TRead = any, TProcessing = any, TSend = any, TWrite = any, TPost = any> {

  private stopper = new Subject();

  constructor(protected ctx: ContextType,
              protected name: string,
              protected converter: IDataConverter<TRead, TProcessing, TWrite, TPost>,
              protected handler: IDataHandler<TProcessing, TSend, TWrite>) {
    this.start$.subscribe();
  }

  private in$ = fromEvent<MessageEvent>(this.ctx, 'message').pipe(
    tap(e => console.log(`${this.name}: converter.read`, e.data)),
    map(e => this.converter.read(e)), // TRead -> TProcessing
    tap(data => this.handler.processing(data)),
  );

  private out$ = this.handler.write$.pipe(
    tap(d1 => console.log(`${this.name}: converter.write`, d1)),
    map(d1 => this.converter.write(d1)), // TWrite -> TPost
    tap(d => this.ctx.postMessage(d.message, d.transfer)),
  );

  private error$ = fromEvent<MessageEvent>(this.ctx, 'message-error').pipe(
    tap(e => console.log(`${this.name} ContextSide error`, e)),
  );

  private start$ = merge(
    this.in$,
    this.out$,
    this.error$,
  ).pipe(
    takeUntil(this.stopper.asObservable()),
    mapTo(null)
  );

  stop() {
    this.stopper.next();
    this.stopper.complete();
  }

}
