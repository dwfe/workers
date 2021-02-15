import {CacheItem} from './cache.item'

export type TGetFromCacheStrategy = 'cache || fetch -> cache';
export type TCacheCleanStrategy = 'not-controlled';

export interface ICacheItemsContainer {

  item(pathname): CacheItem;

  items(): CacheItem[];

  isControl(url: URL): boolean;

}
