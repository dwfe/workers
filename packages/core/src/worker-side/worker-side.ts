import {fromEvent, merge, Subject} from 'rxjs'
import {map, mapTo, takeUntil, tap} from 'rxjs/operators'
import {ContextType, IDataConverter, IDataHandler} from './contract';

export class WorkerSide<TEvent = any, TProcessing = any, TWrite = any, TPost = any> {

  private stopper = new Subject();

  constructor(protected name: string,
              protected converter: IDataConverter<TEvent, TProcessing, TWrite, TPost>,
              protected handler: IDataHandler<TProcessing, TWrite>,
              protected ctx: ContextType) {
    this.start$.subscribe();
  }

  private in$ = fromEvent<MessageEvent>(this.ctx, 'message').pipe(
    tap(data => console.log(`${this.name}: converter.read`, data.data)),
    map(e => this.converter.read(e)), // TEvent -> TProcessing
    tap(data => this.handler.processing(data)),
  );

  private out$ = this.handler.send$.pipe(
    tap(data => console.log(`${this.name}: converter.write`, data)),
    map(d1 => this.converter.write(d1)), // TWrite -> TPost
    tap(d => this.ctx.postMessage(d.message, d.transfer)),
  );

  private start$ = merge(
    this.in$,
    this.out$,
  ).pipe(
    takeUntil(this.stopper.asObservable()),
    mapTo(null)
  );

  stop() {
    this.stopper.next();
    this.stopper.complete();
  }

}
