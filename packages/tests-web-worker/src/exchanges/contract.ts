import {IConverter} from '@dwfe/web-worker';

export type TSide = 'main' | 'worker';

export type TSideData = {
  converter: {
    [key in TSide]: IConverter
  }
}
