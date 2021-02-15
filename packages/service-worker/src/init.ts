declare const self: IServiceWorkerGlobalScope;
import { CacheSw } from "./cache/cache";
import { ExchangeSw } from "./exchange";

export class Init {
  static run() {
    self.CacheSw = CacheSw;
    self.ExchangeSw = ExchangeSw;

    self.log = (...args) => {
      if (self.isDebug) {
        // const date = new Date();
        // const dateISOStringCorrectTimeZone = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
        // console.log(`[${dateISOStringCorrectTimeZone}] sw `, ...args);
        console.log("sw", ...args);
      }
    };

    self.logError = (...args) => {
      console.error("sw", ...args);
    };

    self.delay = async ms => {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
      });
    };
  }
}
