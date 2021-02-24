declare const self: IServiceWorkerGlobalScope;
import {SwEnv} from './src/sw.env';
import {IServiceWorkerGlobalScope} from './types';

self.SwEnv = SwEnv;

self.log = (...args) => {
  if (self.isDebug) {
    // const date = new Date();
    // const dateISOStringCorrectTimeZone = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    // console.log(`[${dateISOStringCorrectTimeZone}] sw `, ...args);
    console.log('sw', ...args);
  }
};

self.logWarn = (...args) => {
  console.warn('sw', ...args);
};

self.logError = (...args) => {
  console.error('sw', ...args);
};

self.delay = ms => new Promise(resolve => setTimeout(resolve, ms));

self.timeout = (ms, promise): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, ms);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(reason => {
        clearTimeout(timer);
        reject(reason);
      });
  });
};
