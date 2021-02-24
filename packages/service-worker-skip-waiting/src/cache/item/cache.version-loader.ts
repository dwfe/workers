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
    let changesCount = 0;
    const items = this.cache.options.items.filter(item => item.version.fetchPath);
    for (let i = 0; i < items.length; i++) {
      const option = items[i];
      const {title} = option;
      const prevVersion = await this.dbHandler.getVersion(title);
      const version = await self.timeout(10_000, this.fetch(option));
      if (prevVersion !== version) {
        await this.dbHandler.putVersion(title, version);
        changesCount++;
      }
    }
    if (changesCount > 0) // после загрузки новых версий надо заново проинициализировать кеш
      await this.cache.init();
  }

  async fetch(option: ICacheItemOptions): Promise<string> {
    const path = option.version.fetchPath as string;
    this.log(`run for '${option.title}' from '${path}'`);
    const version = 'v32'
    //   await fetch(path).then(resp => {
    //   if (resp.ok)
    //     return resp.text();
    //   this.logError(`status: ${resp.status}, content-type: '${resp.headers.get('content-type')}'`)
    // });
    if (version) return version;
    throw new Error(`cache '${option.title}'. Invalid version '${version}' fetched from server`);
  }

  log(...args) {
    self.log('version loader', ...args);
  }

}
