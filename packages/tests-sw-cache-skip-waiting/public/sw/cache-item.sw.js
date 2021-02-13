/**
 * Сущность, которая:
 *   - связана с конкретным кешем и умеет с ним работать
 *   - хранит дополнительную информацию об этом кеше
 */
class CacheItem {
  constructor(cacheName, pathStart) {
    this.cacheName = cacheName;
    this.pathStart = pathStart;
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

  async getCache() {
    return self.caches.open(this.cacheName.value);
  }

  async getInfo() {
    return {
      cacheName: this.cacheName.getInfo(),
      length: await this.getLength()
    };
  }

  async getLength() {
    const keys = await this.getCache().then(cache => cache.keys());
    return keys.length;
  }

  match(pathname) {
    return this.pathStart ? pathname.startsWith(this.pathStart) : false;
  }

  log(...args) {
    self.log(`cache '${this.cacheName.value}'`, ...args);
  }

  logError(...args) {
    self.logError(`cache '${this.cacheName.value}'`, ...args);
  }
}
