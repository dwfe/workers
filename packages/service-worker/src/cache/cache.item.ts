declare const self: IServiceWorkerGlobalScope;
import { IGetFromCache, IGetFromCacheItem } from "../сontract";
import { CacheName } from "./cache.name";

/**
 * Сущность, которая:
 *   - связана с конкретным кешем и умеет с ним работать
 *   - хранит дополнительную информацию об этом кеше
 */
export class CacheItem {
  constructor(public cacheName: CacheName, public pathStart?: string) {}

  cache(): Promise<Cache> {
    return self.caches.open(this.cacheName.value);
  }

  /**
   * Стратегия "cache || fetch -> cache"
   * Поиск в кеше приложения:
   *   = найдено -> отдать браузеру
   *   = не найдено -> запросить сервер -> сохранить в кеш -> отдать браузеру
   */
  async get(data: IGetFromCacheItem): Promise<Response | undefined> {
    const cache = await this.cache();
    const resp = await cache.match(data.cacheKey);
    return resp || this.fetchThenCache(data);
  }

  private async fetchThenCache(
    data: IGetFromCacheItem
  ): Promise<Response | undefined> {
    const { req, cacheKey, connectionTimeout, logPart } = data;
    return (connectionTimeout
      ? self.timeout(connectionTimeout, fetch(req))
      : fetch(req)
    ).then(async resp => {
      if (resp.ok) {
        const cache = await this.cache();
        cache.put(cacheKey, resp.clone());
        this.log(logPart);
        return resp;
      }
      const errMessage = `fetch '${logPart}', status: ${resp.status}`;
      this.logError(errMessage);
    });
  }

  async info(): Promise<any> {
    return {
      cacheName: this.cacheName.info(),
      length: await this.length()
    };
  }

  async length(): Promise<number> {
    const keys = await this.cache().then(cache => cache.keys());
    return keys.length;
  }

  match(pathname): boolean {
    return this.pathStart ? pathname.startsWith(this.pathStart) : false;
  }

  log(...args) {
    self.log(`cache '${this.cacheName.value}'`, ...args);
  }

  logError(...args) {
    self.logError(`cache '${this.cacheName.value}'`, ...args);
  }

  /**
   * Основной причиной конвертера является то, что Cache API работает с понятем: type RequestInfo = Request | string.
   * То есть, например, можно закешировать Request, но ответ сервера в кеш попадет не c ключем Request, а с ключем URL.pathname + URL.search.
   * Соответственно, если приходит string, то тут надо отработать аналогично Cache API -> собрать валидный ключ как URL.pathname + URL.search.
   * Такой более строгий подход уменьшает вероятность того, что в кеше могут появиться данные с неожиданными ключами.
   */
  static convert(data: IGetFromCache): IGetFromCacheItem {
    let { req, path, connectionTimeout } = data;
    if (req) {
      const url = new URL(req.url);
      return {
        req,
        cacheKey: req,
        connectionTimeout,
        url,
        logPart: `${url.pathname}${url.search}${url.hash}`
      };
    } else if (path) {
      if (path.includes("http:") || path.includes("https:"))
        throw new Error(`path '${path}' невалиден`);
      path = path[0] === "/" ? path : `/${path}`; // добавить слеш при отсутствии
      const url = new URL(self.location.origin + path); // path обязательно должен быть в пределах origin sw!
      return {
        req: url.href,
        cacheKey: `${url.pathname}${url.search}`, // точно такой же ключ формирует Cache API при "cacheKey: req"
        connectionTimeout,
        url,
        logPart: `${url.pathname}${url.search}${url.hash}`
      };
    }
    throw new Error(`can't convert data:IGetFromCache`);
  }
}
