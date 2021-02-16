interface IServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
  APP_VERSION: string;
  TILES_VERSION: string;

  SCOPE: string;
  isDebug: boolean;

  CacheSw: any;
  ExchangeSw: any;
  log: (...args) => void;
  logError: (...args) => void;
  delay: (ms: number) => Promise<void>;
  timeout: (ms: number, promise: Promise<any>) => Promise<any>;
}
