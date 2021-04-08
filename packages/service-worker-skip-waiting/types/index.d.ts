import {Type} from 'src/сontract';
import {SwEnv} from 'src/sw.env';

interface IServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {

  isDebug: boolean;
  SwEnv: Type<SwEnv>;
  env: SwEnv;

  log: (...args) => void;
  logWarn: (...args) => void;
  logError: (...args) => void;
  delay: (ms: number) => Promise<void>;
  timeout: (ms: number, promise: Promise<any>) => Promise<any>;

}
