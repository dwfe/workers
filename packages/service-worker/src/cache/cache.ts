declare const self: IServiceWorkerGlobalScope;
import {
  ICacheContainer,
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

  get(
    strategy: TGetFromCacheStrategy,
    key,
    req,
    pathname,
    throwError = false
  ): Promise<Response | undefined> {
    const item = this.item(pathname);
    switch (strategy) {
      case "cache || fetch -> cache":
        return item.get(key, req, pathname, throwError);
      default:
        const errMessage = `sw unknown strategy '${strategy}' of Cache.getValue(…)`;
        throw new Error(errMessage);
    }
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

  item(pathname: string): CacheItem {
    return this.container.item(pathname);
  }

  items(): CacheItem[] {
    return this.container.items();
  }

  info(): Promise<any> {
    return this.container.info();
  }

  async precache(
    strategy: TGetFromCacheStrategy,
    pathnames,
    throwError = false
  ): Promise<void> {
    self.log(
      `pre-caching [${pathnames.length}] files by '${strategy}' strategy…`
    );
    await Promise.all(
      pathnames.map(pathname =>
        this.get(strategy, pathname, pathname, pathname, throwError)
      )
    );
    self.log("pre-caching completed");
  }

  clean(strategy: TCacheCleanStrategy): Promise<void> {
    return this.cleaner.clean(strategy);
  }
}
