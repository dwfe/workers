import {fromEvent, merge} from 'rxjs'
import {map, mapTo, tap} from 'rxjs/operators'
import {IWorkerExchanger} from '../exchanger'
import {IWorkerDataHandler} from '../data-handler'

export class WebWorker {

  constructor(private exchanger: IWorkerExchanger,
              private handler: IWorkerDataHandler) {
  }

  // task from Main -> to Worker
  private task$ = fromEvent<MessageEvent>(self, 'message').pipe(
    map(e => this.exchanger.read(e)),
    tap(data => this.handler.process(data)),
  );

  // result from Worker -> to Main
  private result$ = this.handler.send$.pipe(
    map(data => this.exchanger.write(data)),
    tap(data => (self as DedicatedWorkerGlobalScope).postMessage(data.message, data.transfer)),
  );

  run$ = merge(
    this.task$,
    this.result$,
  ).pipe(
    mapTo(null)
  );

}
