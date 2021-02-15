declare const self: IServiceWorkerGlobalScope;
import {
  ICacheContainer,
  IGetFromCache,
  IGetFromCacheItem,
  TCacheCleanStrategy,
  TGetFromCacheStrategy
} from "./сontract";
import { CacheContainer } from "./cache.container";
import { CacheCleaner } from "./cache.cleaner";
import { CacheItem } from "./cache.item";

export class CacheSw {
  container: ICacheContainer;
  cleaner: CacheCleaner;

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
    args: IGetFromCache
  ): Promise<Response | undefined> {
    return this.getFromCacheItem(strategy, CacheItem.convert(args));
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
        const errMessage = `sw unknown strategy '${strategy}' of Cache.getValue(…)`;
        throw new Error(errMessage);
    }
  }

  async precache(
    strategy: TGetFromCacheStrategy,
    paths: string[],
    throwError = false
  ): Promise<void> {
    self.log(`pre-caching [${paths.length}] files by '${strategy}' strategy…`);
    await Promise.all(
      paths
        .map(str => CacheItem.convert({ str, throwError }))
        .filter(data => this.isControl(data.url))
        .map(data => this.getFromCacheItem(strategy, data))
    );
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
