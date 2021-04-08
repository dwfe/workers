import {CacheItem} from './cache/item/cache.item';

export interface ISwEnvOptions {
  database?: IDatabaseOptions,
  cache?: ICacheOptions,
}


//region Database

export interface IDatabaseOptions {
  name: string;
  /**
   * Версию надо увеличить, если произошло одно из событий:
   *   - изменился состав хранилищ (так называются таблицы в IndexedDB);
   *   - изменилась структура какого-то хранилища.
   * Когда увеличивается версия db (либо когда создается новая db), тогда сразу после открытия базы сработает обработчик 'onupgradeneeded'.
   * Именно там необходимо расположить логику, которая должна реализовать изменения в структуре db.
   * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#creating_or_updating_the_version_of_the_database
   */
  version: number; // Важно! Значение можно только увеличивать.
  storeNames: IDatabaseStoreNames;
}

export interface IDatabaseStoreNames {
  cacheVersion: string;
}

export interface IDatabaseStore<TValue = any> {

  name: string;

  get(key: IDBValidKey): Promise<TValue | undefined>;

  put(value: TValue, key?: IDBValidKey): Promise<IDBValidKey>;

  /**
   * По-идее, хранилище откуда-то берет свои данные.
   * Обновить данные значит: получить данные, сохранить в хранилище и сообщить сколько записей было обновлено.
   */
  update(): Promise<number>; // возвращает количество записей, которые были обновлены

  /**
   * Например, хранилище может знать, что в нем должно быть 3 записи.
   * В данном случае восстановить означает: проверить все ли записи присутствуют, если что-то пропало,
   *                                        тогда восстановить запись и ее значение
   */
  restore(): Promise<number>; // возвращает количество записей, которые были восстановлены

}

//endregion


//region Cache

export interface ICacheOptions {
  controlExtentions: string[];
  items: ICacheItemOptions[];
}

export interface ICacheItemOptions {
  title: string;
  version: {
    value?: string;     // если не задано, тогда версия кеша будет запрашиваться из IndexedDB из таблицы IDatabaseOptions.storeNames.cacheVersion
    fetchPath?: string; // путь до сервиса на сервере, если версию кеша надо получать с сервера
  }
  match: ICacheItemMatchOptions;
}

export interface ICacheItemMatchOptions {
  order: number;     // Когда контейнер кешей решает задачу "какой же CacheItem отдать - item(url: URL): CacheItem?" - то item'ы проверяются в порядке возрастания order,
  pathStart: string; // а проверка заключается в том, что url.pathname должен начинаться с pathStart
  useInCacheControl: boolean; // Когда кеш проверяет "isControl(url: URL)", тогда в проверке может поучавствовать CacheItem, выполняя match на свой pathStart. Item'ы проверяются в порядке возрастания order
}

export type TCacheCleanStrategy = 'delete-uncontrolled';

export interface ICacheContainer {

  init(): Promise<void>;

  items(): CacheItem[];

  item(url: URL): CacheItem;

  isControl(url: URL): boolean;

  size(): number;

  info(): Promise<any>;

}

export interface ICacheCleaner {

  clean(strategy: TCacheCleanStrategy): Promise<void>;

  findToDelete(strategy: TCacheCleanStrategy): Promise<string[]>; // возвращает список имен кешей для удаления

  delete(cacheNames: string[]);

}

export interface ICacheName {

  value: string;

  info();

}


/**
 * Прекеш происходит в момент sw.oninstall.
 * Возможны следующие ситуации:
 *   1. прекеш проходит успешно -> установка/обновление переходит на следующую стадию;
 *   2. сервер отдает файлы очень долго, браузер ждет, файл(ы) в статусе 'pending', sw в статусе 'trying to install':
 *       - если пользователь рефрешит страницу, тогда установка начинается заново;
 *       - если же срабатывает встроенный в браузер connection-timeout (в хроме 5 минут), тогда выбрасывается ошибка.
 *   3. во время установки произошла ошибка, тогда установка прерывается.
 *
 * В связи с этим рекомендаци по прекешу:
 *  1) Если есть возможность, то использовать throwError = false, при этом:
 *       - загрузятся только файлы, на которых не возникло ошибки;
 *       - не прервется процесс 'install'.
 *  2) Рассмотреть возможность задания timeout в несколько секунд, например, 10 сек. на каждый path.
 */
export interface IPrecache {
  strategy: TGetStrategy;
  paths: string[]; // список путей в пределах origin sw, например: "/worker.js", "fonts/times.woff2"
  timeout?: number; // для каждого path
  throwError?: boolean; // надо ли делать throw Error при ошибке, либо просто залогировать ее
}

//endregion


//region Exchange

export type MessageType =
  'GET_INFO' |      // запрос информации о сервис воркера
  'INFO' |          // ответ информацией о сервис воркере
  'RELOAD_PAGE' |   // сигнал: клиент, тебе надо рефрешнуть страницу
  'OFFLINE_START' | // сигнал: сейчас offline
  'OFFLINE_END'     // сигнал: offline закончился, сейчас online
  ;

export interface IMessageEvent extends ExtendableMessageEvent {
  data: {
    type: MessageType;
    data?: any;
  };
}

//endregion


//region Resource

export interface IFetchData {
  req: RequestInfo;   // запрос fetch
  url: URL;           // URL запроса
  timeout?: number;   // время жизни fetch. По умолчанию зависит от браузера: от минуты и выше
  init?: RequestInit; // init параметры fetch
}

export type TGetStrategy =
// запросы идут через кеш
  'cache || fetch -> cache' | // #1
  'fetch -> cache || cache' | // #2 подразумевается прекеш
  'fetch -> cache' |          // #3
  // запросы идут напрямую к серверу
  'fetch';                    // #4

export const noStoreRequestInit: RequestInit = {

  /**
   * Если ожидается, что sw закеширует ответ сервера, тогда:
   *   - запрос должен идти мимо браузерного кеша;
   *   - ответ не должен сохраняться в браузерный кеш.
   * https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
   */
  cache: 'no-store',

};

export interface BrowserFetchData {
  strategy: TGetStrategy;
  data: IFetchData;
}

export type TOffline =
  'byData' |     // offline по результатам запроса данных с сервера
  'byNavigate' | // offline при попытке навигации
  null;          // сейчас online

export type TOfflineNavigateReason = '5xx' | 'catchError';

//endregion


export interface Type<T> extends Function { // тип описывает конструктор какого-то класса
  new(...args: any[]): T;
}
