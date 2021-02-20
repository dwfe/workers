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
        self.logError(`error opening '${this.name}' db`);
        reject(event);
      };
      open.onsuccess = (event: Event) => resolve(open.result);
    });
  }

  getValue(storeName: string, key: IDBValidKey): Promise<any | undefined> {
    return new Promise((resolve, reject) => {
      const logPart = `db'${this.name}'.store'${storeName}'.key'${key}'`;
      const req = this.db
        .transaction([storeName])
        .objectStore(storeName)
        .get(key);
      req.onerror = (event: Event) => {
        self.logError(`error requesting value from ${logPart}`);
        reject(event);
      };
      req.onsuccess = (event: Event) => {
        let result = req.result
        if (result === undefined)
          self.logError(`db value is undefined -> ${logPart}`);
        else
          result = JSON.parse(result);
        resolve(result);
      }
    });
  }

}
