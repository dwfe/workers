declare const self: IServiceWorkerGlobalScope;
import {IServiceWorkerGlobalScope} from '../types';
import {Database} from './database/database';
import {ISwEnvOptions} from './сontract';
import {Cache} from './cache/cache';
import {Exchange} from './exchange';

export class SwEnv {
  database?: Database;
  cache?: Cache;
  exchange: Exchange;

  isReady?: boolean; // окружение проинициализировано?

  constructor(public scope: string,
              public options: ISwEnvOptions) {
    if (options.database)
      this.database = new Database(this);

    if (options.cache)
      this.cache = new Cache(this);

    this.exchange = new Exchange(this);
  }

  async init(): Promise<void> {
    this.isReady = false;
    self.log('initialization…')

    await this.database?.init();
    await this.cache?.init();

    self.log('initialization completed')
    this.isReady = true;
  }

}
