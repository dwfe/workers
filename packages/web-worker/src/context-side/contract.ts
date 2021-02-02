import {Observable} from 'rxjs';

export type ContextType = Worker // для main-контекста
  | DedicatedWorkerGlobalScope;  // для контекста воркера, обычно это self

export interface IMessageEvent<TData = any> extends MessageEvent {
  data: TData;
}

export interface IMessagePost<TData = any> {
  message: TData;
  transfer: Transferable[];
}

export interface IDataConverter<TRead = any, TProcessing = any, TWrite = any, TPost = any> {
  read(e: IMessageEvent<TRead>): TProcessing;

  write(data: TWrite): IMessagePost<TPost>;
}

export interface IDataHandler<TProcessing = any, TSend = any, TWrite = any> {
  processing(data: TProcessing): void;

  send(data: TSend): void;

  write$: Observable<TWrite>;
}
