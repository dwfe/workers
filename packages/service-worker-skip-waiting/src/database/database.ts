declare const self: IServiceWorkerGlobalScope;
import {CacheVersionStore} from './store/cache-version.store';
import {DatabaseController} from './database.controller';
import {IServiceWorkerGlobalScope} from '../../types';
import {IDatabaseOptions, IDatabaseStoreNames} from '../сontract';
import {SwEnv} from '../sw.env';

export class Database {
  private db!: IDBDatabase;
  private controller!: DatabaseController;
  public isReady = false;

  constructor(private sw: SwEnv,
              private options: IDatabaseOptions) {
    if (!self.indexedDB)
      throw new Error(`This browser doesn't support IndexedDB`)
  }

  async init(): Promise<void> {
    if (!this.options) {
      this.isReady = true;
      self.logWarn(`without database`);
      return;
    }
    this.isReady = false;

    /**
     * После этого шага база данных будет открыта и все ожидаемые хранилища будут присутствовать, т.к. пользователю не доступно удаление хранинилищ.
     * Если пользователь удалил db, тогда она автоматически будет создана и запустится событие onupgradeneeded, в котором должна быть логика на создание требуемых хранилищ.
     */
    this.db = await this.open();
    this.controller = new DatabaseController(this, this.db, this.sw.options);

    /**
     * Через панель DevTools пользователю доступно удаление записей любого из хранилищ.
     * Поэтому те хранилища, которые должны иметь предопределенное содержимое, также должны уметь его восстанавливать.
     */
    await this.controller.restoreContent();

    this.isReady = true;
    self.log(` - ${this.toString()} is opened`)
  }

  private open(): Promise<IDBDatabase> {
    this.close();
    const {name, version} = this.options;
    return new Promise((resolve, reject) => {
      const open = self.indexedDB.open(name, version);
      open.onerror = (event: Event) => {
        console.error(`error opening database '${name}#${version}'.`, event?.target?.['error']?.message);
        reject(event);
      };
      open.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        /**
         * 1. Создать/удалить хранилище db можно только в обработчике 'onupgradeneeded'(еще здесь можно создать индексы).
         *   - попытка создать хранилище, которое не существует, создаст его;
         *   - попытка удалить хранилище, которое не существует, вызовет ошибку.
         * Если обработчик 'onupgradeneeded' отработал без ошибок, только тогда будет запущен обработчик 'onsuccess'.
         * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#creating_or_updating_the_version_of_the_database
         *
         * 2. От параметров {keyPath, autoIncrement}: IDBObjectStoreParameters - зависит:
         *   - какого типа может быть значение в хранилище: только JavaScript object, либо еще и примитивы;
         *   - надо ли передавать ключ при сохранении значения в db: если определен keyPath или autoIncrement, тогда не надо;
         *   - по какому ключу можно получить значение: по keyPath, либо произвольная строка.
         * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database
         */
        const db = open.result;
        console.log(`>>> ${db.name}#${db.version} upgrade >>>`, `${event.oldVersion} -> ${event.newVersion}`);

        Object // создать недостающие хранилища
          .entries(this.options.storeNames)
          .forEach(([key, storeName]: [keyof IDatabaseStoreNames, string]) => {
            if (!db.objectStoreNames.contains(storeName)) {
              let storeParameters: IDBObjectStoreParameters;
              switch (key) {
                case 'cacheVersion':
                  storeParameters = {keyPath: null, autoIncrement: false};
              }
              db.createObjectStore(storeName, storeParameters);
              console.log(`  - create '${storeName}'`,)
            }
          });
        switch (event.newVersion) {
          // case X:
          //   // удалить/перезаполнить/...  хранилища именно в момент апгрейда на версию X
          //   break;
        }
        console.log(`>>> upgrade completed >>>`);
      };
      open.onblocked = (event: Event) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/onblocked
        // const db = open.result;
        // db.close() // error: This request has not finished
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


//region Getter'ы хранилищ

  getCacheVersionStore(): CacheVersionStore {
    return this.controller?.getStore(this.options.storeNames.cacheVersion) as any as CacheVersionStore;
  }

//endregion


  toString(): string {
    return `${this.db?.name}#${this.db?.version}`;
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
