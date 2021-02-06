export type Ctx =
  Worker | ServiceWorkerContainer |                      // for Main execution context
  DedicatedWorkerGlobalScope | ServiceWorkerGlobalScope; // for Worker execution context, usually this is reference inside 'self' variable

export enum CtxType { // to simplify conditional checking
  Worker,
  DedicatedWorkerGlobalScope,
  ServiceWorkerContainer,
  ServiceWorkerGlobalScope,
}

export interface IConverter<TSend = any, TPost = any, TRead = any, TReceived = any> {

  write(data: TSend): IMessagePost<TPost>;

  read(e: MessageEvent<TRead>): TReceived;

}

export interface IMessagePost<TData = any> {
  message: TData;
  transfer: Transferable[];
}
