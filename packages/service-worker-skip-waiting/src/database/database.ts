declare const self: IServiceWorkerGlobalScope;
import {IDatabaseOptions} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {SwEnv} from '../sw.env';

export class Database {
  private db!: IDBDatabase; // крайне нежелательно делать это поле публичным
  private name: string;
  private version?: number

  constructor(private sw: SwEnv,
              private options: IDatabaseOptions) {
    if (!self.indexedDB)
      throw new Error(`This browser doesn't support IndexedDB`)
    this.name = options.name;
    this.version = options.version;
  }

  close() {
    this.db.close();
    this.db = null as any;
  }

  get isReady() {
    return !!this.db;
  }

  async init(): Promise<void> {
    if (this.db) this.close(); // попытка повторной инициализации
    this.db = await this.open();
    this.db.onversionchange = (event: IDBVersionChangeEvent) => {
      this.close();
      this.log(`close in 'db.onversionchange' handler, new version '#${event.newVersion}' of this db is ready`);
    }
    self.log(` - ${this.toString()} is opened`)
  }

  open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const open = self.indexedDB.open(this.name, this.version);
      const db = open.result;

      open.onerror = (event: Event) => {
        this.logError(`error opening`);
        reject(event);
      };

      open.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        /**
         * 1. Создать/обновить/удалить хранилище db можно в обработчике 'onupgradeneeded'(еще здесь можно создать индексы).
         *   - попытка создать/удалить хранилище, которое не существует, вызовет ошибку;
         *   - при необходимости изменить уже существующее хранилище сначала надо удалить старое хранилище, затем создать новое с нужными параметрами и содержимым
         * Если обработчик 'onupgradeneeded' отработал без ошибок, только тогда будет запущен обработчик 'onsuccess'.
         * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#creating_or_updating_the_version_of_the_database
         *
         * 2. От структуры хранилища - IDBObjectStoreParameters - зависит:
         *   - какого типа может быть значение в хранилище: любого типа, либо только JavaScript objects;
         *   - надо ли передавать ключ при сохранении значения: если ключ определен в keyPath, тогда не надо;
         *   - по какому ключу можно получить значение: ключ как строка; ключ определенный в keyPath.
         * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database
         */

        const {oldVersion, newVersion} = event;
        console.log(`>>>>>>>> IDB`, {oldVersion, newVersion})

        this.sw.getDatabaseHandlers().forEach(dbHandler => dbHandler.onupgradeneeded(db, event));
      };

      open.onblocked = (event: Event) => {
        /**
         * Сейчас происходит изменение версии db.
         * Текущее открытое соединение было открыто для старой версией db.
         * По какой-то причине обработчик db.onversionchange не закрыл это соединение.
         * Поэтому надо еще раз предпринять попытку, чтобы закрыть соединение с db.
         * https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/onblocked
         */
        this.close();
        this.logError(`close in 'open.onblocked' handler`);
      }

      open.onsuccess = (event: Event) => resolve(db);
    });
  }

  get(storeName: string, key: IDBValidKey): Promise<any | undefined> {
    return new Promise((resolve, reject) => {
      this.log(`get value from ${this.logPart(storeName, key)}`)
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
          this.logError(`value is undefined -> ${this.logPart(storeName, key)}`);
        else
          result = JSON.parse(result);
        resolve(result);
      }
    });
  }

  put(storeName: string, value: any, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      this.log(`put '${value}' to ${this.logPart(storeName, key)}`);
      const req = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .put(value, key);
      req.onerror = (event: Event) => {
        self.logError(`error putting value '${value}' to ${this.logPart(storeName, key)}`);
        reject(event);
      };
      req.onsuccess = (event: Event) => {
        resolve(req.result);
      }
    });
  }

  toString(): string {
    return `db[${this.name}#${this.version || 1}]`;
  }

  logPart(storeName: string, key?: IDBValidKey) {
    return `${this.toString()}.store[${storeName}].key[${key}]`;
  }

  log(...args) {
    self.log(this.toString(), ...args);
  }

  logError(...args) {
    self.logError(this.toString(), ...args);
  }

}
