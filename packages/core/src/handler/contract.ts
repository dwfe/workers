import {Observable} from 'rxjs'

export interface IWorkerDataHandler<TProcessing = any, TWrite = any> {
  processing(data: TProcessing): void;

  send(data: TWrite): void;

  send$: Observable<TWrite>;
}

