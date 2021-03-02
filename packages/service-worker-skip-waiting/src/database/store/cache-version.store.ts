declare const self: IServiceWorkerGlobalScope;
import {ICacheItemOptions, ICacheOptions, IDatabaseStore} from '../../сontract';
import {DatabaseController} from '../database.controller';
import {IServiceWorkerGlobalScope} from '../../../types';

export class CacheVersionStore<TValue = string> implements IDatabaseStore<TValue> {
  static TIMEOUT = 20_000;

  constructor(public name: string,
              private options: ICacheOptions,
              private dbController: DatabaseController) {
    if (!options)
      throw new Error(`sw db store '${name}' can't find cache options`);
  }

  async get(title: string): Promise<TValue | undefined> {
    return this.action('get', title);
  }

  async put(value: TValue, title: string): Promise<IDBValidKey> {
    return this.action('put', title, value);
  }

  private action(action: 'get' | 'put', title: string, version?: TValue) {
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
    return this.options.items.filter(item => item.version.fetchPath);
  }

  async update(): Promise<number> {
    this.log(`updating records…`)
    let count = 0;
    const items = this.controlledItems();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const {title} = item;
      const version = await this.get(title);
      const serverVersion = await self.timeout(CacheVersionStore.TIMEOUT, this.getVersionFromServer(item));
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
        const serverVersion = await self.timeout(CacheVersionStore.TIMEOUT, this.getVersionFromServer(item));
        await this.put(serverVersion, title);
        count++;
      }
    }
    this.log(`restored [${count}] records`)
    return count;
  }

  async getVersionFromServer(option: ICacheItemOptions): Promise<string> {
    const path = option.version.fetchPath as string;
    this.log(`get '${option.title}' version from '${path}'`);
    const version = 'v1';
    // const version = await self.timeout(CacheVersionStore.TIMEOUT, fetch(path)).then(resp => {
    //   if (resp.ok)
    //     return resp.text();
    //   this.logError(`status: ${resp.status}, content-type: '${resp.headers.get('content-type')}'`)
    // });
    if (version) return version;
    throw new Error(`cache '${option.title}'. Invalid version '${version}' fetched from '${path}'`);
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
