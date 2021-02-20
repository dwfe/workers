declare const self: IServiceWorkerGlobalScope;
import {IServiceWorkerGlobalScope} from '../../types';
import {IDatabaseOptions} from '../сontract';
import {SwEnv} from '../sw.env';

export class Database {
  db!: IDBDatabase;
  name: string;
  version?: number

  constructor(private sw: SwEnv) {
    const {name, version} = sw.options.database as IDatabaseOptions;
    this.name = name;
    this.version = version;
  }

  async init(): Promise<void> {
    this.db = await this.open();
    self.log(` - db '${this.name}#${this.version || 1}' opened`,)
  }

  open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const open = self.indexedDB.open(this.name, this.version);
      open.onerror = (event: Event) => {
        this.logError(`error opening '${this.name}' db`);
        reject(event);
      };
      open.onsuccess = (event: Event) => resolve(open.result);
    });
  }

  get(storeName: string, key: IDBValidKey): Promise<any | undefined> {
    return new Promise((resolve, reject) => {
      this.log(`get value from ${this.logPart(storeName, key)}`)
      const req = this.db
        .transaction([storeName])
        .objectStore(storeName)
        .get(key);
      req.onerror = (event: Event) => {
        this.logError('data getting error');
        reject(event);
      };
      req.onsuccess = (event: Event) => {
        let result = req.result
        if (result === undefined)
          this.logError(`value is undefined -> ${this.logPart(storeName, key)}`);
        else
          result = JSON.parse(result);
        resolve(result);
      }
    });
  }

  put(storeName: string, value: string, key: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      this.log(`put '${value}' to ${this.logPart(storeName, key)}`);
      const req = this.db
        .transaction([storeName])
        .objectStore(storeName)
        .put(value, key);
      req.onerror = (event: Event) => {
        self.logError('error putting value');
        reject(event);
      };
      req.onsuccess = (event: Event) => {
        resolve(req.result);
      }
    });
  }

  logPart(storeName: string, key: IDBValidKey) {
    return `.store[${storeName}].key[${key}]`;
  }

  log(...args) {
    self.log(`db'${this.name}'`, ...args);
  }

  logError(...args) {
    self.logError(`db'${this.name}'`, ...args);
  }

}
