import {fromEvent, merge, Subscription} from 'rxjs'
import {map, mapTo, tap, skip} from 'rxjs/operators'
import {IWorkerDataConverter} from '../converter'
import {IWorkerDataHandler} from '../handler'
import {ContextType} from './contract';

export class WorkerSide<TEvent = any, TProcessing = any, TWrite = any, TPost = any> {
  private stopSubscription: Subscription;

  constructor(protected name: string,
              protected converter: IWorkerDataConverter<TEvent, TProcessing, TWrite, TPost>,
              protected handler: IWorkerDataHandler<TProcessing, TWrite>,
              protected ctx: ContextType) {
    this.stopSubscription = this.start$.subscribe();
    // this.ctx.onmessage = (e)=> {console.log(`${this.name} listener`, e['data'])}
  }

  private in$ = fromEvent<MessageEvent>(this.ctx, 'message').pipe(
    // tap(data => console.log(`${this.name}: in$`, data.data)),
    // skip(1),
    tap(data => console.log(`${this.name}: converter.read`, data.data)),
    map(e => this.converter.read(e)), // TEvent -> TProcessing
    tap(data => this.handler.processing(data)),
  );

  private out$ = this.handler.send$.pipe(
    tap(data => console.log(`${this.name}: converter.write`, data)),
    map(d1 => this.converter.write(d1)), // TWrite -> TPost
    tap(d => this.ctx.postMessage(d.message, d.transfer)),
  );

  start$ = merge(
    this.in$,
    this.out$,
  ).pipe(
    mapTo(null)
  );

  stop() {
    this.stopSubscription.unsubscribe()
  }

}
