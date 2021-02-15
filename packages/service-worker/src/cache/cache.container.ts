declare const self: IServiceWorkerGlobalScope;
import {ICacheItemsContainer} from './сontract'
import {CacheName} from './cache.name';
import {CacheItem} from './cache.item';

export class CacheContainer implements ICacheItemsContainer {

  app: CacheItem;
  tiles: CacheItem;

  constructor() {
    const appCacheName = new CacheName('app', self.APP_VERSION);
    this.app = new CacheItem(appCacheName);

    const tilesCacheName = new CacheName('tiles', self.TILES_VERSION);
    this.tiles = new CacheItem(tilesCacheName, '/tiles');
  }

  item(pathname): CacheItem {
    if (this.tiles.match(pathname)) return this.tiles;
    return this.app;
  }

  items(): CacheItem[] {
    return [this.app, this.tiles];
  }

  match(pathname): boolean {
    return this.tiles.match(pathname);
  }

}
