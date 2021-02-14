declare const self: IServiceWorkerGlobalScope;
import {Cache} from './cache/cache';
import {Exchange} from './exchange';

export class Init {
    constructor() {
        self.Cache = Cache;
        self.Exchange = Exchange;

        self.log = (...args) => {
            if (self.isDebug) {
                // const date = new Date();
                // const dateISOStringCorrectTimeZone = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
                // console.log(`[${dateISOStringCorrectTimeZone}] sw `, ...args);

                console.log('sw', ...args);
            }
        };

        self.logError = (...args) => {
            console.error('sw', ...args);
        };

        self.delay = async ms => {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, ms);
            });
        };
    }
}
