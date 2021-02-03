export type ContextType = Worker // for Main thread
  | DedicatedWorkerGlobalScope;  // for Worker thread, usually this is 'self'

export interface IMessagePost<TData = any> {
  message: TData;
  transfer: Transferable[];
}

export interface IConverter<TSend = any, TPost = any, TRead = any, TProcess = any> {

  write(data: TSend): IMessagePost<TPost>;

  read(e: MessageEvent<TRead>): TProcess;

}
