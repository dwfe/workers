import {Observable} from 'rxjs';

export type ContextType = Worker // для main-контекста
  | DedicatedWorkerGlobalScope;  // для контекста воркера, обычно это self

export interface IMessagePost<TData = any> {
  message: TData;
  transfer: Transferable[];
}

export interface IConverter<TWrite = any, TPost = any, TRead = any, TProcess = any> {

  write(data: TWrite): IMessagePost<TPost>;

  read(e: MessageEvent<TRead>): TProcess;

}

export interface IHandler<TSend = any, TWrite = any, TProcess = any> {

  send(data: TSend): void;

  send$: Observable<TWrite>;

  process(data: TProcess): void;

}
