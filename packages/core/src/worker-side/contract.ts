import {Observable} from 'rxjs';

export type ContextType = Worker | DedicatedWorkerGlobalScope;

export interface IMessagePost<TData = any> {
  message: TData;
  transfer: Transferable[];
}

export interface IMessageEvent<TData = any> extends MessageEvent {
  data: TData;
}

export interface IDataConverter<TEvent = any, TProcessing = any, TWrite = any, TPost = any> {
  read(e: IMessageEvent<TEvent>): TProcessing;

  write(data: TWrite): IMessagePost<TPost>;
}

export interface IDataHandler<TProcessing = any, TWrite = any> {
  processing(data: TProcessing): void;

  send(data: TWrite): void;

  send$: Observable<TWrite>;
}
