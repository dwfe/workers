import {Observable} from 'rxjs'

export interface IWorkerDataHandler<TProcessData = any, TSendData = any> {
  process(data: TProcessData): void;

  send(data: TSendData): void;

  send$: Observable<TSendData>;
}

