declare const self: IServiceWorkerGlobalScope;
import {ICacheCleaner, ICacheContainer, ICacheOptions, IFetchData, TCacheCleanStrategy, TGetStrategy} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {CacheContainer} from './cache.container';
import {CacheCleaner} from './cache.cleaner';
import {CacheItem} from './item/cache.item';
import {Precache} from './pre-cache';

export class Cache {
  private container!: ICacheContainer;
  public precache!: Precache;
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
    this.precache = new Precache(this);
    this.cleaner = new CacheCleaner(this);

    this.isReady = true;
    self.log(` - cache is running: ${this.items().map(item => item.cacheName.value).sort((a, b) => a.localeCompare(b)).join(', ')}`);
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
