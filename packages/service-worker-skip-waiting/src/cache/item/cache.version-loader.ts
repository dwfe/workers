declare const self: IServiceWorkerGlobalScope;
import {CacheDatabaseHandler} from '../cache.database-handler';
import {IServiceWorkerGlobalScope} from '../../../types';
import {ICacheItemOptions} from '../../сontract';
import {Cache} from '../cache';

export class CacheVersionLoader {

  constructor(private cache: Cache,
              private dbHandler: CacheDatabaseHandler) {
  }

  async run(): Promise<void> {
    const items = this.cache.options.items.filter(item => item.version.fetchPath);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const version = await this.fetch(item);
      await this.dbHandler.putVersion(item.title, version);
    }
    // после загрузки новых версий кеша надо заново проинициализировать кеш
    await this.cache.init();
  }

  async fetch(item: ICacheItemOptions): Promise<string> {
    const path = item.version.fetchPath as string;
    this.log(`run for '${item.title}' from '${path}'`);
    const version = 'v32'
    //   await fetch(path).then(resp => {
    //   if (resp.ok)
    //     return resp.text();
    //   this.logError(`status: ${resp.status}, content-type: '${resp.headers.get('content-type')}'`)
    // });
    if (version) return version;
    throw new Error(`cache '${item.title}'. Invalid version '${version}' fetched from server`);
  }

  log(...args) {
    self.log('version loader', ...args);
  }

  logError(...args) {
    self.logError('version loader', ...args);
  }
}
