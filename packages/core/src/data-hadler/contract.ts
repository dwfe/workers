import {Observable} from 'rxjs'

export interface IWorkerDataHandler {
  process(data: any): void;

  post(data: IWorkerPostData): void;

  post$: Observable<IWorkerPostData>;
}

export interface IWorkerPostData {
  message: any;
  transfer: Transferable[];
}
