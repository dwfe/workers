import {IWorkerDataConverter} from './contract';
import {IMessageEvent, IMessagePost} from '../worker';

export class StructuredCloneConverter<TProcessing = any, TPost = any> implements IWorkerDataConverter<any, TProcessing, any, TPost> {

  read(e: IMessageEvent): TProcessing {
    return e.data; // do nothing
  }

  write(data): IMessagePost<TPost> {
    return {
      message: data, // do nothing
      transfer: []
    };
  }

}
