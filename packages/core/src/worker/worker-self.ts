import {fromEvent, merge} from 'rxjs'
import {map, mapTo, tap} from 'rxjs/operators'
import {IWorkerDataConverter} from '../converter'
import {IWorkerDataHandler} from '../handler'

export class WorkerSelf<TEvent = any, TProcessing = any, TWrite = any, TPost = any> {

  constructor(private converter: IWorkerDataConverter<TEvent, TProcessing, TWrite, TPost>,
              private handler: IWorkerDataHandler<TProcessing, TWrite>) {
  }

  // incoming data from Main -> to Worker
  private in$ = fromEvent<MessageEvent>(self, 'message').pipe(
    map(e => this.converter.read(e)),
    tap(data => this.handler.processing(data)),
  );

  // outgoing data from Worker -> to Main
  private out$ = this.handler.send$.pipe(
    map(data => this.converter.write(data)),
    tap(data => (self as DedicatedWorkerGlobalScope).postMessage(data.message, data.transfer)),
  );

  run$ = merge(
    this.in$,
    this.out$,
  ).pipe(
    mapTo(null)
  );

}
