declare const self: IServiceWorkerGlobalScope;
import {ICacheCleaner, ICacheContainer, ICacheOptions, IGetFromCache, IGetFromCacheItem, IPrecache, TCacheCleanStrategy, TGetFromCacheStrategy} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {CacheContainer} from './cache.container';
import {CacheCleaner} from './cache.cleaner';
import {CacheItem} from './item/cache.item';
import {SwEnv} from '../sw.env';

export class Cache {
  container: ICacheContainer;
  cleaner: ICacheCleaner;
  options: ICacheOptions;

  constructor(public sw: SwEnv) {
    this.options = sw.options.cache as ICacheOptions;
    this.container = new CacheContainer(this);
    this.cleaner = new CacheCleaner(this);
  }

  async init(): Promise<void> {
    await this.container.init();
    self.log(` - cache is running: ${this.items().map(item => item.cacheName.value).join(', ')}`);
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
    return ext ? this.options.controlExtentions.includes(ext) : false;
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

  async precache(data: IPrecache): Promise<void> {
    if (!data.paths.length) return;
    const {strategy, paths, throwError, connectionTimeout} = data;
    self.log(`pre-cache [${paths.length}] files by strategy '${strategy}'`);

    const queue = paths
      .map(path => CacheItem.convert({path, connectionTimeout}))
      .filter(data => {
        if (this.isControl(data.url)) return true;
        self.logError(`there's no point in pre-cache an uncontrolled resource '${data.url}'`);
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
    self.log('pre-cache completed');
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

  async itemVersionFromDB(title: string): Promise<any | undefined> {
    const storeName = this.options.itemVersionDBStoreName;
    if (!storeName)
      throw new Error(`option 'cache.itemVersionDBStoreName' is not defined`);
    return this.sw.database?.getValue(storeName, title);
  }

  info(): Promise<any> {
    return this.container.info();
  }

}
