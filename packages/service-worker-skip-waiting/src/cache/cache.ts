declare const self: IServiceWorkerGlobalScope;
import {ICacheCleaner, ICacheContainer, IGetFromCache, IGetFromCacheItem, IPrecache, TCacheCleanStrategy, TGetFromCacheStrategy} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {CacheContainer} from './cache.container';
import {CacheCleaner} from './cache.cleaner';
import {CacheItem} from './item/cache.item';

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

    if (pathname.includes('sw.js') || pathname.includes('index.html'))
      return false;
    else if (
      pathname.startsWith('/static') ||
      pathname.startsWith('/fonts') ||
      this.container.isControl(url)
    )
      return true;
    const ext = pathname.split('.').pop();
    return ext ? this.controlExtentions.includes(ext) : false;
  }

  get(strategy: TGetFromCacheStrategy, data: IGetFromCache): Promise<Response | undefined> {
    return this.getFromCacheItem(strategy, CacheItem.convert(data));
  }

  getFromCacheItem(strategy: TGetFromCacheStrategy, data: IGetFromCacheItem): Promise<Response | undefined> {
    const item = this.item(data.url);
    switch (strategy) {
      case 'cache || fetch -> cache':
        return item.get(data);
      default:
        throw new Error(`sw unknown strategy '${strategy}' of Cache.getFromCacheItem(…)`);
    }
  }

  async precache({strategy, paths, throwError, connectionTimeout}: IPrecache): Promise<void> {
    if (paths.length) return;
    self.log(`pre-caching [${paths.length}] files by '${strategy}' strategy…`);

    const queue = paths
      .map(path => CacheItem.convert({path, connectionTimeout}))
      .filter(data => {
        if (this.isControl(data.url)) return true;
        self.logError(`there's no point in pre-caching an uncontrolled resource '${data.url}'`);
        return false;
      });

    /**
     * Для прекеша главное не скорость скачивания, а надежность.
     * Поэтому очередь обрабатывается последовательно.
     */
    for (let i = 0; i < queue.length; i++) {
      const data = queue[i];
      try {
        await this.getFromCacheItem(strategy, data);
      } catch (err) {
        const errMassage = `can't pre-cache '${data.logPart}', ${err.message}`;
        if (throwError) throw new Error(errMassage);
        self.logError(errMassage);
      }
    }
    self.log('pre-caching completed');
  }

  clean(strategy: TCacheCleanStrategy): Promise<void> {
    return this.cleaner.clean(strategy);
  }

  item(url: URL): CacheItem {
    return this.container.item(url);
  }

  items(): CacheItem[] {
    return this.container.items();
  }

  info(): Promise<any> {
    return this.container.info();
  }
}
