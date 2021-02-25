declare const self: IServiceWorkerGlobalScope;
import {ICacheOptions, IDatabaseOptions, ISwEnvOptions} from './сontract';
import {CacheVersionLoader} from './cache.version-loader';
import {IServiceWorkerGlobalScope} from '../types';
import {Database} from './database/database';
import {Cache} from './cache/cache';
import {Exchange} from './exchange';

export class SwEnv {
  database: Database;
  cache: Cache;
  exchange: Exchange;

  cacheVersionLoader: CacheVersionLoader;

  constructor(public scope: string,
              public options: ISwEnvOptions) {
    this.database = new Database(this, options.database as IDatabaseOptions);
    this.cache = new Cache(this, options.cache as ICacheOptions);
    this.exchange = new Exchange(this);
    this.cacheVersionLoader = new CacheVersionLoader(this.database, options);
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
      for (let i = 0; i < 2; i++) {
        await self.delay(5_000)
        if (this.isReady) break;
      }
      if (this.isReady) resolve();
      else {
        reject('sw initialization timeout');
      }
    });
  }

}
