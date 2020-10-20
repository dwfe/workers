import {IMessageEvent, IMessagePost} from '../worker';

export interface IWorkerDataConverter<TEvent = any, TProcessing = any, TWrite = any, TPost = any> {
  read(e: IMessageEvent<TEvent>): TProcessing;

  write(data: TWrite): IMessagePost<TPost>;
}
