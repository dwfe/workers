declare const self: IServiceWorkerGlobalScope;
import {ICacheOptions, IDatabaseStore, IDatabaseStoreNames, ISwEnvOptions} from '../сontract';
import {CacheVersionStore} from './store/cache-version.store';
import {IServiceWorkerGlobalScope} from '../../types';
import {Database} from './database';

export class DatabaseController {
  private stores: Map<string, IDatabaseStore>;

  constructor(private database: Database,
              private db: IDBDatabase,
              private options: ISwEnvOptions) {
    const storeNames = options.database?.storeNames as IDatabaseStoreNames;
    this.stores = new Map([
      [storeNames.cacheVersion, new CacheVersionStore(storeNames.cacheVersion, options.cache as ICacheOptions, this)],
    ]);
  }

  getStore(storeName: string): IDatabaseStore | undefined {
    return this.stores.get(storeName);
  }

  getStores(): IDatabaseStore[] {
    return Array.from(this.stores.values());
  }

  get(storeName: string, key: IDBValidKey): Promise<any | undefined> {
    return new Promise((resolve, reject) => {
      const req = this.db
        .transaction([storeName], 'readonly')
        .objectStore(storeName)
        .get(key);
      req.onerror = (event: Event) => {
        this.logError(`error getting value from ${this.logPart(storeName, key)}`);
        reject(event);
      };
      req.onsuccess = (event: Event) => {
        let result = req.result
        if (result === undefined)
          this.logWarn(`value ${this.logPart(storeName, key)} is undefined`);
        resolve(result);
      }
    });
  }

  put(storeName: string, value: any, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const req = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .put(value, key);
      req.onerror = (event: Event) => {
        self.logError(`error putting value '${value}' to ${this.logPart(storeName, key)}`);
        reject(event);
      };
      req.onsuccess = (event: Event) => resolve(req.result);
    });
  }

  async restoreContent(): Promise<void> {
    const stores = this.getStores();
    for (let i = 0; i < stores.length; i++) {
      await stores[i].restore();
    }
  }


  logPart(storeName: string, key?: IDBValidKey) {
    return this.database.logPart(storeName, key);
  }

  log(...args) {
    this.database.log(...args);
  }

  logWarn(...args) {
    this.database.logWarn(...args);
  }

  logError(...args) {
    this.database.logError(...args);
  }

}
