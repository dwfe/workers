import {IConverter, IMessagePost} from '../index';

export class StructuredCloneConverter<TWrite = any, TPost = any, TRead = any, TProcess = any> implements IConverter<TWrite, TPost, TRead, TProcess> {

  write(data: TWrite): IMessagePost<TPost> {
    return {
      message: data as any as TPost, // do nothing
      transfer: []
    };
  }

  read(e: MessageEvent<TRead>): TProcess {
    return e.data as any as TProcess; // do nothing
  }

}
