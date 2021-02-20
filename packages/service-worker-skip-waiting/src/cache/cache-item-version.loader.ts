import {ICacheItemOptions} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {Cache} from './cache';

declare const self: IServiceWorkerGlobalScope;

export class CacheItemVersionLoader {
  constructor(private cache: Cache) {
  }

  async run(): Promise<void> {
    const items = this.cache.options.items.filter(item => item.version.fetchPath);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const version = await this.fetchVersion(item);
      await this.cache.putItemVersionToDB(item.title, version);
    }
  }

  async fetchVersion(item: ICacheItemOptions): Promise<string> {
    const path = item.version.fetchPath as string;
    this.log(`run for '${item.title}' from '${path}'`);
    const version = 'v32'
    //   await fetch(path).then(resp => {
    //   if (resp.ok)
    //     return resp.text();
    //   this.logError(`status: ${resp.status}, content-type: '${resp.headers.get('content-type')}'`)
    // });
    if (version) return version;
    throw new Error(`invalid version '${version}' received from server`);
  }

  log(...args) {
    self.log('version loader', ...args);
  }

  logError(...args) {
    self.logError('version loader', ...args);
  }
}
