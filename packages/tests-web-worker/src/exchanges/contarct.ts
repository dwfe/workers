import {IConverter} from '@dwfe/web-worker';

export type TExchangeData = {
  mainConverter: IConverter;
  workerConverter: IConverter;
}
