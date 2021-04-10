declare const self: IServiceWorkerGlobalScope;
import {ICacheOptions, IDatabaseOptions, ISwEnvOptions} from './сontract';
import {IServiceWorkerGlobalScope} from '../types';
import {Database} from './database/database';
import {Exchange} from './exchange/exchange';
import {Resource} from './resource/resource';
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
    this.database = new Database(options.database as IDatabaseOptions);
    this.cache = new Cache(options.cache as ICacheOptions);
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

  get(req: Request): Promise<Response | undefined> {
    return this.resource.forBrowser(req);
  }


//region Cache actions

  /**
   * Необходимо заново проинициализировать весь кеш
   * после обновления значений версий кешей в хранилище.
   */
  async updateCacheVersions(): Promise<void> {
    const cacheVersionStore = this.database.getCacheVersionStore();
    const updatedVersions = await cacheVersionStore.updatePredefined();
    if (updatedVersions > 0)
      await this.cache.init();
  }

  private updateCachesLock = false;

  async updateCaches(): Promise<void> {
    if (this.updateCachesLock)
      return;
    this.updateCachesLock = true;
    try {
      const cacheVersionStore = this.database.getCacheVersionStore();
      const predefinedChanged = await cacheVersionStore.findPredefinedChanged();
      if (predefinedChanged.length === 0)
        return;
      self.log('updating caches…');
      for (const changed of predefinedChanged) {
        await this.cache.precache.predefinedPaths({
          strategy: 'fetch -> cache',
          title: changed.key as string,
          version: changed.sourceValue,
          timeout: 10_000,
          throwError: false,
        });
      }
      await this.updateCacheVersions();
      /**
       * Начиная с этого момента браузер навсегда забыл о старых кешах.
       * Теперь ничто не должно помешать отправить клиентам сигнал RELOAD_PAGE.
       */
      try {
        await this.cache.clean('delete-uncontrolled');
      } catch (e) {
        self.logError(e.message);
      }
      self.log('updating caches complete');
      this.exchange.send('RELOAD_PAGE'); // запустить новые версии кешей на клиентах
    } catch (err) {
      self.logError(`updating caches: ${err.message || ''}`);
    } finally {
      this.updateCachesLock = false;
    }
  }

//endregion

}
