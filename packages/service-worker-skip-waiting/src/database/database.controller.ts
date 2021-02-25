import {IDatabaseCheckResult, IDatabaseStoreNames} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {Database} from './database';

declare const self: IServiceWorkerGlobalScope;

export class DatabaseController {

  static DB_VERSION_STORE_KEY = 'version';
  dbVersionStoreName: string;
  cacheVersionStoreName: string;

  constructor(public database: Database,
              public storeNames: IDatabaseStoreNames) {
    this.dbVersionStoreName = this.storeNames.dbVersion;
    this.cacheVersionStoreName = this.storeNames.cacheItemVersion;
  }

  get db(): IDBDatabase {
    return this.database.db;
  }

  contains(storeName: string): boolean {
    return this.db.objectStoreNames.contains(storeName);
  }

  isAllStoresExists(): boolean {
    return Object.values(this.storeNames)
      .map(storeName => this.contains(storeName))
      .every(isContains => isContains === true)
  }

  get(storeName: string, key: IDBValidKey): Promise<any | undefined> {
    return new Promise((resolve, reject) => {
      // this.database.log(`get value from ${this.database.logPart(storeName, key)}`)
      const req = this.db
        .transaction([storeName], 'readonly')
        .objectStore(storeName)
        .get(key);
      req.onerror = (event: Event) => {
        this.database.logError(`error getting value from ${this.database.logPart(storeName, key)}`);
        reject(event);
      };
      req.onsuccess = (event: Event) => {
        let result = req.result
        if (result === undefined)
          this.database.logWarn(`value is undefined -> ${this.database.logPart(storeName, key)}`);
        resolve(result);
      }
    });
  }

  put(storeName: string, value: any, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      // this.database.log(`put '${value}' to ${this.database.logPart(storeName, key)}`);
      const req = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .put(value, key);
      req.onerror = (event: Event) => {
        self.logError(`error putting value '${value}' to ${this.database.logPart(storeName, key)}`);
        reject(event);
      };
      req.onsuccess = (event: Event) => {
        resolve(req.result);
      }
    });
  }

  async initStores(checkResult: IDatabaseCheckResult): Promise<void> {
    if (checkResult.dbVersionStoreInitNeeded) {
      await this.dbVersionStoreInit();
    }
    if (checkResult.cacheVersionStoreFetchNeeded) {
      await this.database.sw.cacheVersionLoader.run();
    }
  }

//region Хранилище версии базы данных

  async getDbVersion(): Promise<any | undefined> {
    return this.dbVersionDBAction('get');
  }

  async putDbVersion(version: number): Promise<IDBValidKey> {
    return this.dbVersionDBAction('put', version);
  }

  private dbVersionDBAction(action: 'get' | 'put', version?: number) {
    const key = DatabaseController.DB_VERSION_STORE_KEY;
    switch (action) {
      case 'get':
        return this.get(this.dbVersionStoreName, key);
      case 'put':
        if (!version)
          throw new Error(`sw invalid version '${version} put to ${this.database.logPart(this.dbVersionStoreName, key)}'`);
        return this.put(this.dbVersionStoreName, version, key);
    }
  }

  async dbVersionStoreInit() {
    const optDbVersion = this.database.optDbVersion;
    await this.putDbVersion(optDbVersion);
  }

//endregion


//region Хранилище версий кешей

  async getCacheVersion(title: string): Promise<any | undefined> {
    return this.cacheVersionDBAction('get', title);
  }

  async putCacheVersion(title: string, version: string): Promise<IDBValidKey> {
    return this.cacheVersionDBAction('put', title, version);
  }

  private cacheVersionDBAction(action: 'get' | 'put', title: string, version?: string) {
    if (!title)
      throw new Error(`invalid title '${title}'`);

    switch (action) {
      case 'get':
        return this.get(this.cacheVersionStoreName, title);
      case 'put':
        if (!version)
          throw new Error(`sw invalid version '${version}' put to ${this.database.logPart(this.cacheVersionStoreName, title)}'`);
        return this.put(this.cacheVersionStoreName, version, title);
    }
  }

//endregion

}
