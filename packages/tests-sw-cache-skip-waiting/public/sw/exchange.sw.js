/**
 * Отвечает за обработку/обмен сообщениями
 * между сервис воркером и его клиентами
 */
class Exchange {
  constructor(cache) {
    this.cache = cache;
  }

  async send(type, data) {
    const clients = await Clients.getAll();
    this.log(`sending '${type}' to [${clients.length}] clients…`);
    clients.forEach(client => client.postMessage({type, data}));
  }

  async process(event) {
    const {data} = event;
    this.log(`process '${data.type}'`);

    switch (data.type) {
      case "GET_INFO":
        this.send("INFO", {
          caches: await cache.getInfo()
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
