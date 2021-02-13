/**
 * - знает обо всех кешах приложения
 * - умеет получать/сохранять/обслуживать данные этих кешей
 */
class Cache {
  constructor(controlExtentions) {
    this.app = new CacheItem(new CacheName('app', self.APP_VERSION));
    this.tiles = new CacheItem(new CacheName('tiles', self.TILES_VERSION), '/tiles');
    this.controlExtentions = controlExtentions;
  }

  async get(strategy, key, req, pathname, throwError = false) {
    const cacheItem = this.getItem(pathname);
    switch (strategy) {
      case 'cache || fetch -> cache':
        return cacheItem.get(key, req, pathname, throwError);
      default:
        throw new Error(
          `sw unknown strategy '${strategy}' of Cache.getValue(…)`
        );
    }
  }

  getItem(pathname) {
    if (this.tiles.match(pathname)) return this.tiles;
    return this.app;
  }

  getItems() {
    return [this.app, this.tiles];
  }

  async getInfo() {
    return Promise.all(this.getItems().map(item => item.getInfo()));
  }

  isControl(url) {
    if (url.origin !== self.location.origin) return false;
    const pathname = url.pathname;

    if (pathname.includes('sw.js') || pathname.includes('index.html'))
      return false;
    else if (
      pathname.startsWith('/static') ||
      pathname.startsWith('/fonts') ||
      this.tiles.match(pathname)
    )
      return true;
    const ext = pathname.split('.').pop();
    return this.controlExtentions.includes(ext);
  }

  async precache(strategy, pathnames, throwError = false) {
    self.log(`pre-caching [${pathnames.length}] files…`);
    await Promise.all(
      pathnames.map(pathname =>
        this.get(strategy, pathname, pathname, pathname, throwError)
      )
    );
    self.log('pre-caching completed');
  }

  /**
   * Очищать кеш необходимо ввиду следующих причин:
   *   - может измениться формат имени кеша;
   *   - кеш может устареть (версия поменяется).
   *
   * Например, в какой-то момент времени может оказаться, что приложение хранит кеши с вот такими именами:
   var cacheNames = [
   "/:ap",
   "/:app:",
   "/:app:v222",
   "/:appchxi:v222",
   "/:app:v333",
   "/:app:v333:",
   "/:tiles:12",
   "/:tiles:v222",
   "/:tiles:v333",
   "/:tiles - v12",
   "v111",
   ":app:",
   "/test:tiles:v111",
   "Dfge73.32._sgjdsd",
   "",
   "/:тайлы:18",
   "мой кеш",
   ]
   */
  async clear() {
    self.log('cache clearing…');

    /**
     * Удалить кеши, которые гарантированно не могут контролироваться данным sw.
     * ВНИМАНИЕ! Данный подход подойдет, если к origin привязан только один sw,
     *           иначе есть высокая вероятность того, что вы удалите кеш, принадлежащий другим sw этого origin
     */
    const expectedTitleVersion = this.getItems().map(item => item.cacheName.parsed.titleVersion);
    const badNames = (await self.caches.keys())
      .map(cacheName => CacheName.parse(cacheName))
      .filter(
        parsed =>
          !CacheName.isStructureValid(parsed) ||
          parsed.scope !== self.SCOPE ||
          !expectedTitleVersion.includes(parsed.titleVersion)
      )
      .map(parsed => parsed.cacheName);

    await Promise.all(
      badNames
        .map(cacheName => {
          self.log(`delete cache '${cacheName}'`);
          return self.caches.delete(cacheName);
        })
    );

    self.log('cache clearing completed');
  }

}
