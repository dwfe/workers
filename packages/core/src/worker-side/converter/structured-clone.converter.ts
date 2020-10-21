import {IDataConverter, IMessageEvent, IMessagePost} from '../index';

export class StructuredCloneConverter<TProcessing = any, TPost = any> implements IDataConverter<any, TProcessing, any, TPost> {

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
