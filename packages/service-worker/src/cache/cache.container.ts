declare const self: IServiceWorkerGlobalScope;
import { ICacheContainer } from "../сontract";
import { CacheName } from "./cache.name";
import { CacheItem } from "./cache.item";

export class CacheContainer implements ICacheContainer {
  app: CacheItem;
  tiles: CacheItem;

  constructor() {
    const appCacheName = new CacheName("app", self.APP_VERSION);
    this.app = new CacheItem(appCacheName);

    const tilesCacheName = new CacheName("tiles", self.TILES_VERSION);
    this.tiles = new CacheItem(tilesCacheName, "/tiles");
  }

  item(pathname: string): CacheItem {
    if (this.tiles.match(pathname)) return this.tiles;
    return this.app;
  }

  items(): CacheItem[] {
    return [this.app, this.tiles];
  }

  info(): Promise<any> {
    return Promise.all(this.items().map(item => item.info()));
  }

  isControl(url: URL): boolean {
    return this.tiles.match(url.pathname);
  }
}
