import { CacheItem } from "./cache/cache.item";

export type TGetFromCacheStrategy = "cache || fetch -> cache";
export type TCacheCleanStrategy = "not-controlled";

export interface ICacheContainer {
  item(pathname: string): CacheItem;

  items(): CacheItem[];

  info(): Promise<any>;

  isControl(url: URL): boolean;
}

/**
 * Запросить из кеша можно двумя путями:
 *  1) req - передать Request, который был перехвачен в sw.onfetch
 *  2) path - передать какую-то произвольную строку запроса в пределах origin этого sw, например: "/worker.js", "/fonts/times.woff2"
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
  req: RequestInfo; // передается в fetch(req)
  cacheKey: RequestInfo; // ключ в кеше
  logPart: string; // используется для логирования
  connectionTimeout?: number;
  url: URL; // url запроса
}

/**
 * Прекеш происходит в момент sw.oninstall.
 * Если происходит ошибка, то новый sw не устанавливается.
 * Натыкался на кейс:
 *    - сервер долго отвечает (сам по себе, либо файлов нужных у него нет и он неожиданно долго думает что делать);
 *    - файлы повисают в 'pending'.
 *   Если в такой ситуации сделать F5, то в хроме sw может навсегда повиснуть в статусе 'trying to install'.
 *   Помогает только ручная разрегистрация и то не с первого раза.
 * В связи с этим рекомендаци по прекешу:
 *  1) Если есть возможность, то использовать throwError = false, при этом:
 *       - загрузятся только файлы, на которых не возникло ошибки;
 *       - не прервется процесс 'install'.
 *  2) Рассмотреть возможность задания connectionTimeout в несколько секунд, например, 10 сек. на каждый файл.
 */
export interface IPrecache {
  strategy: TGetFromCacheStrategy;
  paths: string[]; // список путей в пределах origin этого sw, например: "/worker.js", "/fonts/times.woff2"
  throwError?: boolean; // надо ли делать throw Error при ошибке, либо просто залогировать ее
  connectionTimeout?: number;
}

export type MessageType = "GET_INFO" | "INFO" | "RELOAD_PAGE";
export interface IMessageEvent extends ExtendableMessageEvent {
  data: {
    type: MessageType;
    data: any;
  };
}
