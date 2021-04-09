declare const self: IServiceWorkerGlobalScope;
import {ICacheCleaner, ICacheContainer, ICacheItemOptions, ICacheOptions, IFetchData, IPrecache, TCacheCleanStrategy, TGetStrategy} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {CacheContainer} from './cache.container';
import {Resource} from '../resource/resource';
import {CacheCleaner} from './cache.cleaner';
import {CacheItem} from './item/cache.item';

export class Cache {
  private container!: ICacheContainer;
  private cleaner!: ICacheCleaner;
  public isReady = false;

  constructor(public options: ICacheOptions) {
    if (!self.caches)
      throw new Error(`This browser doesn't support Cache API`)
  }

  async init(): Promise<void> {
    if (!this.options) {
      this.isReady = true;
      self.logWarn(`without cache`);
      return;
    }
    this.isReady = false;

    this.container = new CacheContainer(this.options.items);
    await this.container.init();
    this.cleaner = new CacheCleaner(this);

    this.isReady = true;
    self.log(` - cache is running: ${this.items().map(item => item.cacheName.value).join(', ')}`);
  }

  get controlExtentions(): string[] {
    return this.options.controlExtentions || [];
  }

  isControl(url: URL): boolean {
    if (url.origin !== self.location.origin) // Текущая политика:
      return false;                          // не кешировать ответы с чужих ресурсов

    const pathname = url.pathname;
    if (pathname.includes('sw.js'))
      return false;
    else if (
      pathname.includes('/static/') ||
      pathname.startsWith('/index.html') ||
      pathname.startsWith('/manifest.json') ||
      /\/apple.*\.png/.test(pathname) ||
      /\/favicon.*\.png/.test(pathname) ||
      /\/mstile.*\.png/.test(pathname) ||
      this.container.isControl(url)
    )
      return true;
    const ext = pathname.split('.').pop();
    return ext ? this.controlExtentions.includes(ext) : false;
  }

  get(strategy: TGetStrategy, data: IFetchData): Promise<Response | undefined> {
    const item = this.item(data.url);
    return item.getByStrategy(strategy, data);
  }


//region Pre-cache

  async precache(data: IPrecache): Promise<void> {
    if (!data.paths.length) return;
    const {strategy, paths, throwError, timeout} = data;
    self.log(`pre-cache [${paths.length}] files by strategy '${strategy}'`);

    const queue = paths.map(path => Resource.fetchData(path, timeout));

    /**
     * Для прекеша главное не скорость скачивания, а надежность.
     * Поэтому очередь обрабатывается последовательно.
     */
    for (let i = 0; i < queue.length; i++) {
      const data = queue[i];
      try {
        await this.get(strategy, data);
      } catch (err) {
        const errMassage = `can't pre-cache '${Resource.path(data.url)}', ${err.message}`;
        if (throwError) throw new Error('sw ' + errMassage);
        self.logError(errMassage);
      }
    }
    self.log('pre-cache complete');
  }

  async precacheExactItem(strategy: TGetStrategy, title: string, version: string): Promise<void> {
    const options = this.options.items.find(item => item.title === title) as ICacheItemOptions;
    const paths = options?.precachePaths;
    if (!paths || paths.length === 0)
      return;
    const item = CacheItem.of(title, version, {match: options.match});
    self.log(`pre-cache ${item.cacheName.value}, [${paths.length}] files by strategy '${strategy}'`);
    for (const path of paths) {
      try {
        await item.getByStrategy(strategy, Resource.fetchData(path, 10_000));
      } catch (err) {
        const errMassage = `can't pre-cache '${path}', ${err.message}`;
        self.logError(errMassage);
      }
    }
    self.log('pre-cache complete');
  }

  getItemsPrecachePaths(): string[] {
    return this.options.items
      .flatMap(item => item.precachePaths || [])
      .sort((a, b) => a.localeCompare(b));
  }

//endregion


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
