declare const self: IServiceWorkerGlobalScope;
import {Cache} from './cache/cache';

/**
 * Отвечает за обработку/обмен сообщениями
 * между сервис воркером и его клиентами
 */
export class Exchange {
    constructor(public cache: Cache) {
    }

    async send(type, data) {
        const clients = await self.clients.matchAll();
        this.log(`sending '${type}' to [${clients.length}] clients…`);
        clients.forEach(client => client.postMessage({ type, data }));
    }

    async process(event) {
        const { data } = event;
        this.log(`process '${data.type}'`);

        switch (data.type) {
            case "GET_INFO":
                this.send("INFO", {
                    caches: await this.cache.getInfo()
                });
                break;
            default:
                throw new Error(
                    `sw unknown message type '${data.type}' of Exchange.process(…)`
                );
        }
    }

    log(...args) {
        self.log("exchange", ...args);
    }

    logError(...args) {
        self.logError("exchange", ...args);
    }
}
