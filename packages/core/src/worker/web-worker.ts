import {fromEvent, merge} from 'rxjs'
import {map, mapTo, tap} from 'rxjs/operators'
import {IWorkerExchanger} from '../exchanger';
import {IWorkerDataHandler} from '../data-hadler';

export class WebWorker {

  constructor(private exchanger: IWorkerExchanger,
              private handler: IWorkerDataHandler) {
  }

  // task from Main has arrived to Worker
  private task$ = fromEvent<MessageEvent>(self, 'message').pipe(
    map(event => this.exchanger.read(event.data)),
    tap(data => this.handler.process(data)),
  );

  // send result from Worker to Main
  private result$ = this.handler.post$.pipe(
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
