declare const self: IServiceWorkerGlobalScope;
import {CacheItemOptions, ICacheName, IFetchData} from '../../сontract';
import {IServiceWorkerGlobalScope} from '../../../types';
import {Resource} from '../../resource/resource';
import {CacheName} from './cache.name';

/**
 * Сущность, которая:
 *   - связана с конкретным кешем и умеет с ним работать
 *   - хранит дополнительную информацию об этом кеше
 */
export class CacheItem {

  static of(title: string, version: string, options: CacheItemOptions): CacheItem {
    const cacheName = new CacheName(title, version);
    return new CacheItem(cacheName, options);
  }

  constructor(public cacheName: ICacheName,
              public options: CacheItemOptions) {
  }

  cache(): Promise<Cache> {
    return self.caches.open(this.cacheName.value);
  }

  async get(data: IFetchData): Promise<Response | undefined> {
    const cache = await this.cache();
    return cache.match(data.req);
  }

  async put(resp: Response, data: IFetchData): Promise<void> {
    const cache = await this.cache();
    cache.put(data.req, resp.clone());
  }


  /**
   * Стратегия 'cache || fetch -> cache'
   * Поиск в кеше приложения:
   *   = найдено -> отдать браузеру
   *   = не найдено -> запросить сервер -> сохранить в кеш -> отдать браузеру
   */
  async getByStrategy1(data: IFetchData): Promise<Response | undefined> {
    return await this.get(data) || this.fetchThenCache(data);
  }

  /**
   * Стратегия 'fetch -> cache || cache'
   * Подразумевается прекеш запрашиваемых файлов.
   * Сначала делать запрос на сервер:
   *   = success -> отдать браузеру + кешировать
   *   = error -> отдать из кеша
   */
  async getByStrategy2(data: IFetchData): Promise<Response> {
    try {
      return await this.fetchThenCache(data);
    } catch (ignored) {
    }
    const resp = await this.get(data);
    if (resp) return resp;
    throw new Error(`getByStrategy2 for '${Resource.path(data.url)}', not found in the cache`);
  }

  /**
   * Стратегия 'fetch -> cache'
   * Сделать запрос на сервер:
   *   = success -> отдать браузеру + кешировать
   *   = error -> выбросить ошибку
   */
  async getByStrategy3(data: IFetchData): Promise<Response> {
    return await this.fetchThenCache(data);
  }


  private async fetchThenCache(data: IFetchData): Promise<Response> {
    return self.env.resource.fetchStrict(data)
      .then(async resp => {
        await this.put(resp, data);
        this.log(Resource.path(data.url));
        return resp;
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

  match(url: URL): boolean {
    const {pathStart} = this.options.match;
    return pathStart ? url.pathname.startsWith(pathStart) : false;
  }

  log(...args) {
    self.log(`cache '${this.cacheName.value}'`, ...args);
  }

  logError(...args) {
    self.logError(`cache '${this.cacheName.value}'`, ...args);
  }

}
