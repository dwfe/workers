import {ModuleSw} from '../module.sw';
import {CacheSw} from '../src/cache/cache';
import {ExchangeSw} from '../src/exchange';

interface IServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
  cacheControlExtentions: string[];
  SCOPE: string;
  isDebug: boolean;

  cache: CacheSw;
  exchange: ExchangeSw;
  ModuleSw: ModuleSw;

  log: (...args) => void;
  logError: (...args) => void;
  delay: (ms: number) => Promise<void>;
  timeout: (ms: number, promise: Promise<any>) => Promise<any>;
}
