declare const self: IServiceWorkerGlobalScope;
import {ICacheContainer} from '../сontract';
import {CacheName} from './item/cache.name';
import {CacheItem} from './item/cache.item';

/**
 * В контейнере необходимо сразу знать какие кеши вообще возможны в приложении.
 * Потому что, если логику создания CacheItem еще можно заранее универсализировать,
 * то логику выбора, какой кеш использовать: CacheContainer.item(url: URL) - уже нельзя.
 */
export type TCacheTitle = 'app' | 'tiles';

export class CacheContainer implements ICacheContainer {
  app: CacheItem;
  tiles: CacheItem;

  constructor() {
    this.app = new CacheItem(CacheName.of('app', 'self'));
    this.tiles = new CacheItem(CacheName.of('tiles', 'self'), {pathStart: '/tiles'});
  }

  item(url: URL): CacheItem {
    if (this.tiles.match(url)) return this.tiles;
    return this.app;
  }

  items(): CacheItem[] {
    return [this.app, this.tiles];
  }

  info(): Promise<any> {
    return Promise.all(this.items().map(item => item.info()));
  }

  isControl(url: URL): boolean {
    return this.tiles.match(url);
  }
}
