export interface IWorkerPostData<TMessage = any> {
  message: TMessage;
  transfer: Transferable[];
}
