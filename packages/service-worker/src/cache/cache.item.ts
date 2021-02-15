declare const self: IServiceWorkerGlobalScope;
import { IGetFromCache, IGetFromCacheItem } from "./сontract";
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
  async get({
    req,
    cacheKey,
    logId,
    throwError
  }: IGetFromCacheItem): Promise<Response | undefined> {
    const cache = await this.cache();
    return (
      (await cache.match(cacheKey)) ||
      self.timeout(self.connectionTimeout,fetch(req)).then(resp => {
        if (resp.ok) {
          cache.put(cacheKey, resp.clone());
          this.log(logId);
          return resp;
        }
        const errMessage = `fetch '${logId}', response status: ${resp.status}`;
        if (throwError) throw new Error(errMessage);
        this.logError(errMessage);
      })
    );
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
   * Конвертер нужен, так как Cache API работает с понятем:
   *   type RequestInfo = Request | string;
   * То есть, например, закешить можно Request, но ответ сервера в кеш попадет не c ключем Request, а с ключем pathname+search.
   * Соответственно, если приходит string, то тут надо отработать аналогично Cache API - собрать валидный ключ pathname+search.
   * В основном из-за этого и был сделан конвертер.
   */
  static convert({ req, str, throwError }: IGetFromCache): IGetFromCacheItem {
    if (req) {
      const url = new URL(req.url);
      return {
        req,
        cacheKey: req,
        logId: `${url.pathname}${url.search}${url.hash}`,
        throwError,
        url
      };
    } else if (str) {
      str = str[0] === "/" ? str : `/${str}`; // если нет слеша - добавить
      const url = new URL(self.location.origin + str);
      return {
        req: url.href,
        cacheKey: `${url.pathname}${url.search}`, // точно такой же ключ автоматически формируется и при "cacheKey: req"
        logId: `${url.pathname}${url.search}${url.hash}`,
        throwError,
        url
      };
    }
    throw new Error(
      `can't parse args CacheItem.prepareGetFromCacheData(IGetFromCacheArgs)`
    );
  }
}
