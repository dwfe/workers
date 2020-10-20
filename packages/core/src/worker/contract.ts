export interface IMessagePost<TData = any> {
  message: TData;
  transfer: Transferable[];
}

export interface IMessageEvent<TData = any> extends MessageEvent {
  data: TData;
}
