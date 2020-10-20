import {fromEvent, merge} from 'rxjs'
import {map, mapTo, tap} from 'rxjs/operators'
import {IWorkerDataConverter} from '../converter'
import {IWorkerDataHandler} from '../handler'

export class WorkerEngine<TEvent = any, TProcessing = any, TWrite = any, TPost = any> {

  constructor(protected converter: IWorkerDataConverter<TEvent, TProcessing, TWrite, TPost>,
              protected handler: IWorkerDataHandler<TProcessing, TWrite>,
              protected context: DedicatedWorkerGlobalScope | Worker = (self as DedicatedWorkerGlobalScope)) {
  }

  private incomingData$ = fromEvent<MessageEvent>(this.context, 'message').pipe(
    map(e => this.converter.read(e)), // TEvent -> TProcessing
    tap(data => this.handler.processing(data)),
  );

  private outgoingData$ = this.handler.send$.pipe(
    map(d1 => this.converter.write(d1)), // TWrite -> TPost
    tap(d => this.context.postMessage(d.message, d.transfer)),
  );

  run$ = merge(
    this.incomingData$,
    this.outgoingData$,
  ).pipe(
    mapTo(null)
  );

}
