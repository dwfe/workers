declare const self: IServiceWorkerGlobalScope;
import {ICacheContainer, ICacheItemOptions} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {CacheName} from './item/cache.name';
import {CacheItem} from './item/cache.item';

export class CacheContainer implements ICacheContainer {

  private container: Map<string, CacheItem> = new Map();

  constructor(private itemsOpt: ICacheItemOptions[]) {
    if (!itemsOpt?.length)
      throw new Error(`sw missing description of cache items`);
  }

  async init(): Promise<void> {
    for (let i = 0; i < this.itemsOpt.length; i++) {
      const dto = this.itemsOpt[i];
      const {title, match} = dto;

      /**
       * Действия для получения версии кеша:
       *   1) взять значение из поля itemOption.version.value
       *   2) иначе взять версию из базы данных
       */
      let version = dto.version.value;
      if (!version) {
        version = await self.env.database.getCacheVersionStore().get(title);
        if (!version)
          throw new Error(`sw cache container can't get version for '${title}'`);
      }
      const cacheName = new CacheName(title, version);
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
    return this.items[this.items.length - 1]; // куда-то же надо складывать, если не найден конкретный кеш
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
