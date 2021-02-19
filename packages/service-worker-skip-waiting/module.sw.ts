declare const self: IServiceWorkerGlobalScope;
import {IServiceWorkerGlobalScope} from './types';
import {CacheSw} from './src/cache/cache';
import {ExchangeSw} from './src/exchange';

export class ModuleSw {

  static async init(): Promise<void> {
    self.cache = new CacheSw(self.cacheControlExtentions);
    self.exchange = new ExchangeSw(self.cache);
  }

}
