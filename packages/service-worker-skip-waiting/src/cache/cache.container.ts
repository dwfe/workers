import {IServiceWorkerGlobalScope} from '../../types';
import {ICacheContainer} from '../сontract';
import {CacheName} from './item/cache.name';
import {CacheItem} from './item/cache.item';
import {Cache} from './cache';

declare const self: IServiceWorkerGlobalScope;

export class CacheContainer implements ICacheContainer {

  container: Map<string, CacheItem> = new Map();

  constructor(private cache: Cache) {
  }

  async init(): Promise<void> {
    const {items} = this.cache.options;
    for (let i = 0; i < items.length; i++) {
      const dto = items[i];
      const scope = this.cache.sw.scope;
      const {title, match} = dto;
      const version = dto.version.value || await this.cache.getItemVersionFromDB(title);
      const cacheName = new CacheName(scope, title, version);
      const item = new CacheItem(cacheName, {match});
      this.container.set(cacheName.value, item);
    }
  }

  items(): CacheItem[] {
    return Array
      .from(this.container.values())
      .sort((a, b) => a.options.match.order - b.options.match.order); // порядок важен для item(url) и isControl(url)
  }

  item(url: URL): CacheItem {
    const found = this.items().find(item => item.match(url));
    if (found)
      return found;
    return this.items[this.items.length - 1];
  }

  isControl(url: URL): boolean {
    const found = this.items()
      .filter(item => item.options.match.useInCacheControl)
      .find(item => item.match(url));
    return !!found;
  }

  info(): Promise<any> {
    return Promise.all(this.items().map(item => item.info()));
  }

}
