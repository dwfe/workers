import {IWorkerPostData} from '../worker';

export interface IWorkerExchanger<TReadResult = any, TWriteData = any, TMessage = any> {
  read(e: MessageEvent): TReadResult;

  write(data: TWriteData): IWorkerPostData<TMessage>;
}
