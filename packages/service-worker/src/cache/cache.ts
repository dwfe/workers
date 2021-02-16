declare const self: IServiceWorkerGlobalScope;
import {
  ICacheCleaner,
  ICacheContainer,
  IGetFromCache,
  IGetFromCacheItem,
  IPrecache,
  TCacheCleanStrategy,
  TGetFromCacheStrategy
} from "../сontract";
import { CacheContainer } from "./cache.container";
import { CacheCleaner } from "./cache.cleaner";
import { CacheItem } from "./cache.item";

export class CacheSw {
  container: ICacheContainer;
  cleaner: ICacheCleaner;

  constructor(public controlExtentions: string[] = []) {
    this.container = new CacheContainer();
    this.cleaner = new CacheCleaner(this);
  }

  isControl(url: URL): boolean {
    if (url.origin !== self.location.origin) return false;
    const pathname = url.pathname;

    if (pathname.includes("sw.js") || pathname.includes("index.html"))
      return false;
    else if (
      pathname.startsWith("/static") ||
      pathname.startsWith("/fonts") ||
      this.container.isControl(url)
    )
      return true;
    const ext = pathname.split(".").pop();
    return ext ? this.controlExtentions.includes(ext) : false;
  }

  get(
    strategy: TGetFromCacheStrategy,
    data: IGetFromCache
  ): Promise<Response | undefined> {
    return this.getFromCacheItem(strategy, CacheItem.convert(data));
  }

  getFromCacheItem(
    strategy: TGetFromCacheStrategy,
    data: IGetFromCacheItem
  ): Promise<Response | undefined> {
    const item = this.item(data.url.pathname);
    switch (strategy) {
      case "cache || fetch -> cache":
        return item.get(data);
      default:
        const errMessage = `sw unknown strategy '${strategy}' of Cache.getFromCacheItem(…)`;
        throw new Error(errMessage);
    }
  }

  async precache(data: IPrecache): Promise<void> {
    if (!data.paths.length) return;
    const { strategy, paths, throwError, connectionTimeout } = data;
    self.log(`pre-caching [${paths.length}] files by '${strategy}' strategy…`);

    const arr = paths
      .map(path => CacheItem.convert({ path, connectionTimeout }))
      .filter(data => this.isControl(data.url));

    /**
     * Для прекеша главное не скорость скачивания, а надежность.
     * Поэтому очередь обрабатывается последовательно.
     */
    for (let i = 0; i < arr.length; i++) {
      const data = arr[i];
      try {
        await this.getFromCacheItem(strategy, data);
      } catch (err) {
        const errMassage = `can't pre-cache '${data.logPart}', ${err.message}`;
        if (throwError) throw new Error(errMassage);
        self.logError(errMassage);
      }
    }
    self.log("pre-caching completed");
  }

  clean(strategy: TCacheCleanStrategy): Promise<void> {
    return this.cleaner.clean(strategy);
  }

  item(pathname: string): CacheItem {
    return this.container.item(pathname);
  }

  items(): CacheItem[] {
    return this.container.items();
  }

  info(): Promise<any> {
    return this.container.info();
  }
}
