import {fromEvent, merge} from 'rxjs'
import {map, mapTo, tap} from 'rxjs/operators'
import {IWorkerDataConverter} from '../converter'
import {IWorkerDataHandler} from '../handler'
import {ContextType} from './contract';

export class WorkerSide<TEvent = any, TProcessing = any, TWrite = any, TPost = any> {

  constructor(protected converter: IWorkerDataConverter<TEvent, TProcessing, TWrite, TPost>,
              protected handler: IWorkerDataHandler<TProcessing, TWrite>,
              protected ctx: ContextType) {
  }

  private in$ = fromEvent<MessageEvent>(this.ctx, 'message').pipe(
    map(e => this.converter.read(e)), // TEvent -> TProcessing
    tap(data => this.handler.processing(data)),
  );

  private out$ = this.handler.send$.pipe(
    map(d1 => this.converter.write(d1)), // TWrite -> TPost
    tap(d => this.ctx.postMessage(d.message, d.transfer)),
  );

  run$ = merge(
    this.in$,
    this.out$,
  ).pipe(
    mapTo(null)
  );

}
