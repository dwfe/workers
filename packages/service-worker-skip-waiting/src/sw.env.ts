declare const self: IServiceWorkerGlobalScope;
import {IServiceWorkerGlobalScope} from '../types';
import {Database} from './database/database';
import {Exchange} from './exchange/exchange';
import {Resource} from './resource/resource';
import {ISwEnvOptions} from './сontract';
import {Cache} from './cache/cache';

export class SwEnv {
  database: Database;
  cache: Cache;
  exchange: Exchange;
  resource: Resource;

  constructor(public scope: string, // Используется, например, при определении имени кеша. Задается вручную, чтобы было наглядно видно - этот sw.js работает на таком-то scope. Необязательно указывать полный scope, например, для scope 'http://mysite.ru/' достаточно указать только '/'
              public options: ISwEnvOptions) {
    if (!scope)
      throw new Error(`sw scope can't be empty`);
    this.database = new Database(options.database);
    this.cache = new Cache(options.cache);
    this.exchange = new Exchange();
    this.resource = new Resource();
  }

  async init(): Promise<void> {
    self.log('initialization…')
    await this.database.init();
    await this.cache.init();
    self.log('initialization complete')
  }

  get isReady(): boolean { // должен отвечать максимально быстро
    return this.database.isReady
      && this.cache.isReady;
  }

  waitForReady(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.isReady)
        resolve();
      for (let i = 0; i < 12; i++) {
        await self.delay(5_000)
        if (this.isReady) break;
      }
      if (this.isReady)
        resolve();
      else
        reject('sw initialization timeout');
    });
  }

  async updateCacheVersions(): Promise<void> {
    const store = this.database.getCacheVersionStore();
    if (store && await store.update() > 0)
      await this.cache.init();
  }

  get(req: Request): Promise<Response | undefined> {
    return this.resource.forBrowser(req);
  }

}
