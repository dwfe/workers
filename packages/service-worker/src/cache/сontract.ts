import { CacheItem } from "./cache.item";

export type TGetFromCacheStrategy = "cache || fetch -> cache";
export type TCacheCleanStrategy = "not-controlled";

export interface ICacheContainer {
  item(pathname: string): CacheItem;

  items(): CacheItem[];

  info(): Promise<any>;

  isControl(url: URL): boolean;
}

export type MessageType = "GET_INFO" | "INFO" | "RELOAD_PAGE";
export interface IMessageEvent extends ExtendableMessageEvent {
  data: {
    type: MessageType;
    data: any;
  };
}

/**
 * Запросить из кеша можно двумя путями:
 *  1) req - передать Request, который был перехвачен в sw.fetch
 *  2) str - передать какую-то произвольную строку запроса, например при pre-cache
 */
export interface IGetFromCache {
  req?: Request;
  str?: string;
  throwError?: boolean; // надо ли делать throw Error, если произошла ошибка
}

/**
 * Аргументы, которые нужны для того, чтобы запросить у CacheItem
 */
export interface IGetFromCacheItem {
  req: RequestInfo; // передается в fetch(req)
  cacheKey: RequestInfo; // ключ в кеше
  logId: string; // идентификатор для логирования
  throwError?: boolean; // надо ли делать throw Error, если произошла ошибка
  url: URL; // url объект запроса
}
