import {IConverter, IMessagePost} from '../index'

export class StructuredCloneConverter<TSend = any, TPost = any, TRead = any, TReceived = any> implements IConverter<TSend, TPost, TRead, TReceived> {

  write(data: TSend): IMessagePost<TPost> {
    return {
      message: data as any as TPost, // do nothing
      transfer: []
    };
  }

  read(e: MessageEvent<TRead>): TReceived {
    return e.data as any as TReceived; // do nothing
  }

}
