declare const self: IServiceWorkerGlobalScope;
import {IMessageEvent, MessageType} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {SwEnv} from '../sw.env';

/**
 * Отвечает за обработку/обмен сообщениями
 * между сервис воркером и его клиентами
 */
export class Exchange {

  constructor(private sw: SwEnv) {
  }

  async send(type: MessageType, data, source?: ExtendableMessageEvent['source']) {
    if (source) source.postMessage({type, data}, []); // отправить конкретному получателю
    else {
      const clients = await self.clients.matchAll();
      this.log(`send '${type}' to [${clients.length}] clients…`);
      clients.forEach(client => client.postMessage({type, data}));
    }
  }

  async process(event: IMessageEvent) {
    const {data, source} = event;
    this.log(`process '${data.type}'`);

    switch (data.type) {
      case 'GET_INFO':
        this.send('INFO', {
          caches: await this.sw.cache?.info()
        }, source);
        break;
      default:
        throw new Error(`sw unknown message type '${data.type}' of Exchange.process(…)`);
    }
  }

  log(...args) {
    self.log('exchange', ...args);
  }

  logError(...args) {
    self.logError('exchange', ...args);
  }
}
