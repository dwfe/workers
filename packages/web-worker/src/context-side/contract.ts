export type ContextType = Worker // для main-контекста
  | DedicatedWorkerGlobalScope;  // для контекста воркера, обычно это self

export interface IMessagePost<TData = any> {
  message: TData;
  transfer: Transferable[];
}

export interface IConverter<TSend = any, TPost = any, TRead = any, TProcess = any> {

  write(data: TSend): IMessagePost<TPost>;

  read(e: MessageEvent<TRead>): TProcess;

}
