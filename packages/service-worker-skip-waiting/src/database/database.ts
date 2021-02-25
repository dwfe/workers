import {DatabaseController} from './database.controller';
import {IServiceWorkerGlobalScope} from '../../types';
import {DatabaseChecker} from './database.checker';
import {IDatabaseOptions} from '../сontract';
import {SwEnv} from '../sw.env';

declare const self: IServiceWorkerGlobalScope;

export class Database {
  name!: string;
  db!: IDBDatabase;
  controller!: DatabaseController;
  isReady = false;

  constructor(public sw: SwEnv,
              public options: IDatabaseOptions) {
    if (!self.indexedDB)
      throw new Error(`This browser doesn't support IndexedDB`)
  }

  get optionDbVersion(): number {
    return this.options?.version || 1;
  }

  async init(): Promise<void> {
    if (!this.options) {
      this.isReady = true;
      self.logWarn(`without database`);
      return;
    }
    this.isReady = false;
    this.name = this.options.name;
    this.db = await this.open(); // открыть базу в текущей ее версии
    this.controller = new DatabaseController(this);
    const checker = new DatabaseChecker(this.controller, this.sw.options);
    const checkResult = await checker.run();

    // Скорректировать структуру базы данных
    if (checkResult.upgradeNeeded) {
      let version = this.db.version;
      this.db = await this.open(++version); // переоткрыть базу с новой версией => запустится апгрейд базы данных
    }
    // Предопределенные хранилища должны иметь ожидаемое содержимое
    await this.controller.initStores(checkResult);

    this.isReady = true;
    self.log(` - ${this.toString()} is opened`)
  }

  open(version?: number): Promise<IDBDatabase> {
    this.close();
    return new Promise((resolve, reject) => {
      const open = self.indexedDB.open(this.name, version);
      open.onerror = (event: Event) => {
        console.error('error opening database');
        reject(event);
      };
      open.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        /**
         * 1. Создать/удалить хранилище db можно в обработчике 'onupgradeneeded'(еще здесь можно создать индексы).
         *   - попытка удалить хранилище, которое не существует, вызовет ошибку;
         * Если обработчик 'onupgradeneeded' отработал без ошибок, только тогда будет запущен обработчик 'onsuccess'.
         * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#creating_or_updating_the_version_of_the_database
         *
         * 2. От параметров {keyPath, autoIncrement}: IDBObjectStoreParameters - зависит:
         *   - какого типа может быть значение в хранилище: только JavaScript object, либо любого типа;
         *   - надо ли передавать ключ при сохранении значения в db: если определен keyPath, тогда не надо;
         *   - по какому ключу можно получить значение: по keyPath, либо произвольная строка.
         * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database
         */
        const db = open.result;
        console.log(`>>> ${db.name}#${db.version} upgrade >>>`, `${event.oldVersion} -> ${event.newVersion}`);

        Object.values(this.options.storeNames).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, {keyPath: null, autoIncrement: false});
          }
        });
      };
      open.onblocked = (event: Event) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/onblocked
        // const db = open.result;
        // db.close() // err: This request has not finished
        console.error(`Database is blocked. Your database version can't be upgraded because the app is open somewhere else`);
      }
      open.onsuccess = (event: Event) => {
        const db = open.result;
        db.onversionchange = (event: IDBVersionChangeEvent) => {
          db.close();
          console.log(`close ${db.name}#${db.version} in 'db.onversionchange' handler, new version '${event.newVersion}' of this db is ready`)
        }
        resolve(db);
      };
    });
  }

  close() {
    this.db?.close();
    this.db = null as any;
  }

  toString(): string {
    return `${this.name}#${this.db.version || 'unknown'}`;
  }

  logPart(storeName: string, key?: IDBValidKey) {
    return `${storeName}.${key}`;
  }

  log(...args) {
    self.log(this.toString(), ...args);
  }

  logWarn(...args) {
    self.logWarn(this.toString(), ...args);
  }

  logError(...args) {
    self.logError(this.toString(), ...args);
  }

}
