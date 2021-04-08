declare const self: IServiceWorkerGlobalScope;
import {noStoreRequestInit, ICacheItemOptions, ICacheOptions, IDatabaseStore} from '../../сontract';
import {DatabaseController} from '../database.controller';
import {IServiceWorkerGlobalScope} from '../../../types';
import {Resource} from '../../resource/resource';

export class CacheVersionStore implements IDatabaseStore<string> {
  private cacheOptions: ICacheOptions;

  constructor(public name: string,
              private dbController: DatabaseController) {
    this.cacheOptions = self.env.options.cache;
    if (!this.cacheOptions)
      throw new Error(`sw db store '${name}' can't find cache options`);
  }

  async get(title: string): Promise<string | undefined> {
    return this.action('get', title);
  }

  async put(value: string, title: string): Promise<IDBValidKey> {
    return this.action('put', title, value);
  }

  private action(action: 'get' | 'put', title: string, version?: string) {
    if (!title)
      throw new Error(`sw invalid title '${title}'`);

    switch (action) {
      case 'get':
        return this.dbController.get(this.name, title);
      case 'put':
        if (!version)
          throw new Error(`sw invalid version '${version}' put to ${this.logPart(title)}'`);
        return this.dbController.put(this.name, version, title);
    }
  }

  /**
   * Хранилище содержит только те записи {title кеша => версия кеша},
   * версии которых планируется запрашивать с сервера
   */
  controlledItems(): ICacheItemOptions[] {
    return this.cacheOptions.items.filter(item => item.version.fetchPath);
  }

  async update(): Promise<number> {
    this.log(`updating records…`)
    let count = 0;
    const items = this.controlledItems();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const {title} = item;
      const version = await this.get(title);
      const serverVersion = await this.getVersionFromServer(item);
      if (version !== serverVersion) {
        await this.put(serverVersion, title);
        count++;
      }
    }
    this.log(`updated [${count}] records`)
    return count;
  }

  async restore(): Promise<number> {
    this.log(`restoring records…`)
    let count = 0;
    const items = this.controlledItems();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const {title} = item;
      const version = await this.get(title);
      if (version === undefined) {
        const serverVersion = await this.getVersionFromServer(item);
        await this.put(serverVersion, title);
        count++;
      }
    }
    this.log(`restored [${count}] records`)
    return count;
  }

  async getVersionFromServer(option: ICacheItemOptions): Promise<string> {
    const path = option.version.fetchPath;
    this.log(`fetch '${option.title}' version from '${path}'`);
    try {
      const data = Resource.fetchData(path, 10_000, noStoreRequestInit);
      const resp = await self.env.resource.fetchStrict(data);
      const version = await resp.text();
      return version.trim();
    } catch (err) {
      this.logError(`for '${option.title}': ${err.message}`);
    }
    return 'unknown';
  }


  logPart(key: IDBValidKey) {
    return this.dbController.logPart(this.name, key);
  }

  log(...args) {
    this.dbController.log(`store '${this.name}'`, ...args);
  }

  logError(...args) {
    this.dbController.logError(`store '${this.name}'`, ...args);
  }

}
