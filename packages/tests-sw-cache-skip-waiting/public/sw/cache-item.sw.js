/**
 * Сущность, которая:
 *   - связана с конкретным кешем и умеет с ним работать
 *   - хранит дополнительную информацию об этом кеше
 */
class CacheItem {
  constructor(title, version, pathStart) {
    this.title = title;
    this.version = version;
    this.pathStart = pathStart;
    this.cacheName = Cache.getCacheName(title, version);
  }

  match(pathname) {
    return this.pathStart ? pathname.startsWith(this.pathStart) : false;
  }

  async getCache() {
    return self.caches.open(this.cacheName);
  }

  async getLength() {
    const keys = await this.getCache().then(cache => cache.keys());
    return keys.length;
  }

  async getInfo() {
    return {
      title: this.title,
      version: this.version,
      length: await this.getLength()
    }
  }

  /**
   * Стратегия "cache || fetch -> cache"
   * Поиск в кеше приложения:
   *   = найдено -> отдать браузеру
   *   = не найдено -> запросить сервер -> сохранить в кеш -> отдать браузеру
   */
  async get(key, req, pathname, throwError) {
    const cache = await this.getCache();
    return (
      (await cache.match(key)) ||
      fetch(req).then(resp => {
        if (resp.ok) {
          cache.put(key, resp.clone());
          this.log(pathname);
          return resp;
        }
        const errMessage = `fetch '${pathname}', HTTP status: ${resp.status}`;
        if (throwError) throw new Error(errMessage);
        this.logError(errMessage);
      })
    );
  }

  log(...args) {
    self.log(`cache '${this.cacheName}'`, ...args);
  }

  logError(...args) {
    self.logError(`cache '${this.cacheName}'`, ...args);
  }
}
