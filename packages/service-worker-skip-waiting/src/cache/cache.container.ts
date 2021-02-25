import {DatabaseController} from '../database/database.controller';
import {ICacheContainer} from '../сontract';
import {CacheName} from './item/cache.name';
import {CacheItem} from './item/cache.item';
import {Cache} from './cache';

export class CacheContainer implements ICacheContainer {

  private container: Map<string, CacheItem> = new Map();

  constructor(private cache: Cache) {
  }

  get dbController(): DatabaseController {
    return this.cache.sw.database.controller;
  }

  async init(): Promise<void> {
    const {items} = this.cache.options;
    for (let i = 0; i < items.length; i++) {
      const dto = items[i];
      const {title, match} = dto;
      const scope = this.cache.sw.scope;

      /**
       * Действия для получения версии кеша:
       *   1) взять значение из поля 'version.value'
       *   2) иначе взять версию из базы данных
       */
      let version = dto.version.value;
      if (!version) {
        version = await this.dbController.getCacheVersion(title);
        if (!version)
          throw new Error(`sw cache container can't get version for '${title}'`);
      }
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

  size(): number {
    return this.container.size;
  }

  info(): Promise<any> {
    return Promise.all(this.items().map(item => item.info()));
  }

}
