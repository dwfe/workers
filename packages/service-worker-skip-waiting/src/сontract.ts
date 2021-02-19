import {CacheItem} from './cache/item/cache.item';

export type TGetFromCacheStrategy = 'cache || fetch -> cache';
export type TCacheCleanStrategy = 'uncontrolled';

export type TCacheVersionStore = 'self' | 'IndexedDB';
export type TCacheVersionReceivingMethod = 'server';

export const swCacheFetchInit: RequestInit = {
  /**
   * Если ожидается, что sw закеширует ответ сервера, тогда:
   *   - запрос должен идти мимо браузерного кеша;
   *   - ответ не должен сохраняться в браузерный кеш.
   * https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
   */
  cache: 'no-store'
};

export interface ICacheContainer {
  item(url: URL): CacheItem;

  items(): CacheItem[];

  info(): Promise<any>;

  isControl(url: URL): boolean;
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
 * Запросить из кеша можно двумя путями:
 *  1) req - передать Request, который был перехвачен в sw.onfetch
 *  2) path - передать строку запроса в пределах origin sw, например: "/worker.js", "/fonts/times.woff2"
 */
export interface IGetFromCache {
  req?: Request;
  path?: string;
  connectionTimeout?: number; // задать время жизни fetch. По умолчанию же зависит от браузера: от минуты и выше
}

/**
 * Аргументы, которые могут понадобиться при запросе у CacheItem
 */
export interface IGetFromCacheItem {
  req: RequestInfo;      // передается в fetch(req)
  cacheKey: RequestInfo; // ключ в кеше
  connectionTimeout?: number;
  url: URL;              // url запроса
  logPart: string;       // используется для логирования
}

/**
 * Прекеш происходит в момент sw.oninstall.
 * Возможны следующие ситуации:
 *   1. прекеш проходит успешно -> установка/обновление переходит на следующую стадию;
 *   2. сервер отдает файлы очень долго, браузер ждет, файл(ы) в статусе 'pending', sw в статусе 'trying to install':
 *       - если пользователь рефрешит страницу, тогда установка начинается заново;
 *       - если же срабатывает встроенный в браузер connection-timeout (в хроме 5 минут), тогда выбрасывается ошибка.
 *   3. во время установки произошла ошибка, тогда установка прерыватся.
 *
 * В связи с этим рекомендаци по прекешу:
 *  1) Если есть возможность, то использовать throwError = false, при этом:
 *       - загрузятся только файлы, на которых не возникло ошибки;
 *       - не прервется процесс 'install'.
 *  2) Рассмотреть возможность задания connectionTimeout в несколько секунд, например, 10 сек. на каждый path.
 */
export interface IPrecache {
  strategy: TGetFromCacheStrategy;
  paths: string[]; // список путей в пределах origin sw, например: "/worker.js", "/fonts/times.woff2"
  throwError?: boolean; // надо ли делать throw Error при ошибке, либо просто залогировать ее
  connectionTimeout?: number; // для каждого path
}

export type MessageType = 'GET_INFO' | 'INFO' | 'RELOAD_PAGE';

export interface IMessageEvent extends ExtendableMessageEvent {
  data: {
    type: MessageType;
    data: any;
  };
}
