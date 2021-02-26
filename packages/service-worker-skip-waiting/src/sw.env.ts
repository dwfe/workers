declare const self: IServiceWorkerGlobalScope;
import {ICacheOptions, IDatabaseOptions, ISwEnvOptions} from './сontract';
import {IServiceWorkerGlobalScope} from '../types';
import {Database} from './database/database';
import {Exchange} from './exchange/exchange';
import {Cache} from './cache/cache';

export class SwEnv {
  database: Database;
  cache: Cache;
  exchange: Exchange;

  constructor(public scope: string,
              public options: ISwEnvOptions) {
    this.database = new Database(this, options.database as IDatabaseOptions);
    this.cache = new Cache(this, options.cache as ICacheOptions);
    this.exchange = new Exchange(this);
  }

  async init(): Promise<void> {
    self.log('initialization…')
    await this.database.init();
    await this.cache.init();
    self.log('initialization completed')
  }

  get isReady(): boolean {
    return this.database.isReady
      && this.cache.isReady;
  }

  waitForReady(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < 10; i++) {
        await self.delay(5_000)
        if (this.isReady) break;
      }
      if (this.isReady) resolve();
      else {
        reject('sw initialization timeout');
      }
    });
  }

  async updateCacheVersions(): Promise<void> {
    const store = this.database.getCacheVersionStore();
    if (await store.update() > 0)
      await this.cache.init();
  }

}
