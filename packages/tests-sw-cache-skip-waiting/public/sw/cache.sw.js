/**
 * - знает обо всех кешах приложения
 * - умеет получать/сохранять/обслуживать данные этих кешей
 */
class Cache {
  constructor() {
    this.app = new CacheItem("app", self.APP_VERSION);
    // this.tiles = new CacheItem("tiles", self.TILES_VERSION, "/tiles");
  }

  isControl(url) {
    if (url.origin !== self.location.origin) return false;
    const pathname = url.pathname;

    if (pathname.includes("sw.js") || pathname.includes("index.html"))
      return false;
    else if (
      pathname.startsWith("/static") ||
      pathname.startsWith("/fonts")
      // this.tiles.match(pathname)
    )
      return true;
    const ext = pathname.split(".").pop();
    return self.controlExtentions.includes(ext);
  }

  getItem(pathname) {
    // if (this.tiles.match(pathname)) return this.tiles;
    return this.app;
  }

  get items() {
    return [this.app];
  }

  async get(strategy, key, req, pathname, throwError = false) {
    const cacheItem = this.getItem(pathname);
    switch (strategy) {
      case "cache || fetch -> cache":
        return cacheItem.get(key, req, pathname, throwError);
      default:
        throw new Error(
          `sw unknown strategy '${strategy}' of Cache.getValue(…)`
        );
    }
  }

  async getInfo() {
    return Promise.all(
      this.items.map(item => item.getInfo())
    );
  }

  async precaching(strategy, pathnames, throwError = false) {
    self.log(`pre-caching [${pathnames.length}] files…`);
    await Promise.all(
      pathnames.map(pathname =>
        this.get(strategy, pathname, pathname, pathname, throwError)
      )
    );
    self.log("pre-caching completed");
  }

  /**
   * Очищать кеш необходимо ввиду следующих причин:
   *   - может измениться формат имени кеша;
   *   - кеш может устареть (версия поменяется).
   *
   * Например, в какой-то момент времени может оказаться, что приложение хранит кеши с вот такими именами:
   var cacheNames = [
   "/:app:v222",
   "/:tiles:12",
   "/:ap",
   "/:appchxi:v222",
   "v111",
   "/:app:",
   ":app:",
   "/:app:v333",
   "/:app:v333:",
   "/test:tiles:v111",
   "/:tiles - v12",
   "Dfge73.32._sgjdsd",
   "",
   "/:тайлы:18",
   "мой кеш",
   "/:tiles:v222",
   "/:tiles:v333",
   ]
   */
  async clearing() {
    self.log("cache clearing…");

    const cacheNames = await self.caches.keys();
    const expectedTitleVersion = this.items
      .map(item => Cache.parseCacheName(item.cacheName))
      .map(parsed => parsed.titleVersion);

    /**
     * Удалить кеши, которые гарантированно не могут контролироваться данным sw:
     *   - имя кеша должно соответствовать текущему формату;
     *   - элементы имени кеша должны совпадать с ожидаемыми для них значениями.
     *
     * ВНИМАНИЕ! Данный подход подойдет, если к origin привязан только один sw,
     *           иначе есть высокая вероятность того, что вы удалите кеш, принадлежащий другим sw этого origin
     */
    await Promise.all(
      cacheNames
        .map(cacheName => Cache.parseCacheName(cacheName))
        .filter(
          parsed =>
            !Cache.isCacheNameStructureValid(parsed) ||
            parsed.scope !== self.SCOPE ||
            !expectedTitleVersion.includes(parsed.titleVersion)
        )
        .map(parsed => parsed.cacheName)
        .map(cacheName => {
          self.log(`delete cache '${cacheName}'`);
          return caches.delete(cacheName);
        })
    );

    self.log("cache clearing completed");
  }

  //region CacheName

  static DELIMITER = ":";

  /**
   * Формат имени кеша имеет следующий вид:
   *
   *      scope:title:version
   *      [0]   [1]   [2]
   * здесь
   *   scope   - scope данного sw
   *   title   - название контролируемой сущности
   *   version - версия кеша
   *   :       - разделитель
   */
  static parseCacheName(cacheName) {
    const arr = cacheName.split(Cache.DELIMITER);
    const scope = arr[0];
    const title = arr[1];
    const version = arr[2];
    return {
      scope,
      title,
      version,
      arr,
      cacheName,
      titleVersion: `${title}${Cache.DELIMITER}${version}`
    };
  }

  static isCacheNameStructureValid({ scope, title, version, arr }) {
    return arr.length === 3 && !!scope && !!title && !!version;
  }

  /**
   * Так как к origin может быть привязано несколько сервис воркеров,
   * то имя кеша начинается со SCOPE сервис воркера.
   *
   * А еще у одного сервис воркера может быть несколько подконтрольных ему кешей,
   * поэтому имя дополняется названием контролируемой сущности - title.
   *
   * Со временем кеш может устареть, поэтому в конце имени добавляется версии этого кеша - version
   *
   * Например, такие имена:
   *   /:tiles:v1
   *   /:app:34.189.0.1
   *   /test: приложение:version 18
   */
  static getCacheName(title, version) {
    // ВНИМАНИЕ! Если изменил формат, тогда еще внеси изменения в функции: parseCacheName, isCacheNameStructureValid
    return `${self.SCOPE}${Cache.DELIMITER}${title}${
      Cache.DELIMITER
    }${version}`;
  }

  //endregion
}
