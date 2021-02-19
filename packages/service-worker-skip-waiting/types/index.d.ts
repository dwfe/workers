interface IServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
  SCOPE: string;
  isDebug: boolean;

  CacheSw: any;
  ExchangeSw: any;
  log: (...args) => void;
  logError: (...args) => void;
  delay: (ms: number) => Promise<void>;
  timeout: (ms: number, promise: Promise<any>) => Promise<any>;
}
