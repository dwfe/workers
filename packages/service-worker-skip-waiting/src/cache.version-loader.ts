import {ICacheItemOptions, ISwEnvOptions} from './сontract';
import {IServiceWorkerGlobalScope} from '../types';
import {Database} from './database/database';

declare const self: IServiceWorkerGlobalScope;

export class CacheVersionLoader {

  constructor(private database: Database,
              private options: ISwEnvOptions) {
  }

  async run(): Promise<number> {
    if (!this.options.cache)
      return 0;
    let changesCount = 0;
    const items = this.options.cache.items.filter(item => item.version.fetchPath);
    for (let i = 0; i < items.length; i++) {
      const option = items[i];
      const {title} = option;
      const prevVersion = await this.database.controller.getCacheVersion(title);
      const version = await self.timeout(10_000, this.fetch(option));
      if (prevVersion !== version) {
        await this.database.controller.putCacheVersion(title, version);
        changesCount++;
      }
    }
    return changesCount;
  }

  async fetch(option: ICacheItemOptions): Promise<string> {
    const path = option.version.fetchPath as string;
    this.log(`get '${option.title}' version from '${path}'`);
    const version = 'v32';
    // await self.timeout(10_000, fetch(path)).then(resp => {
    //   if (resp.ok)
    //     return resp.text();
    //   this.logError(`status: ${resp.status}, content-type: '${resp.headers.get('content-type')}'`)
    // });
    if (version) return version;
    throw new Error(`cache '${option.title}'. Invalid version '${version}' fetched from '${path}'`);
  }

  log(...args) {
    self.log('version loader', ...args);
  }

  logError(...args) {
    self.logError('version loader', ...args);
  }

}
