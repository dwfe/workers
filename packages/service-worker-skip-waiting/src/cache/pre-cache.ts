declare const self: IServiceWorkerGlobalScope;
import {ICacheItemOptions, ICacheOptions, IPrecache, IPrecacheItem, IPrecachePredefinedPaths} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {Resource} from '../resource/resource';
import {CacheItem} from './item/cache.item';

export class Precache {

  constructor(private cache) {
  }

  private get options(): ICacheOptions {
    return this.cache.options;
  }

  /**
   * Прекеш согласно стандартному алгоритму получения данных из Cache
   */
  async run({strategy, paths, timeout, throwError}: IPrecache): Promise<void> {
    if (!paths.length) return;
    self.log(`pre-cache [${paths.length}] files by strategy '${strategy}'`);
    for (const path of paths) {
      try {
        await this.cache.get(strategy, Resource.fetchData(path, timeout));
      } catch (err) {
        const errMassage = `can't pre-cache '${path}', ${err.message}`;
        if (throwError) throw new Error('sw ' + errMassage);
        self.logError(errMassage);
      }
    }
    self.log('pre-cache complete');
  }

  /**
   * Прекеш в конкретный CacheItem
   */
  async runForItem({item, strategy, paths, timeout, throwError}: IPrecacheItem): Promise<void> {
    if (!paths.length) return;
    self.log(`pre-cache ${item.cacheName.value}, [${paths.length}] files by strategy '${strategy}'`);
    for (const path of paths) {
      try {
        await item.getByStrategy(strategy, Resource.fetchData(path, timeout));
      } catch (err) {
        const errMassage = `can't pre-cache '${path}', ${err.message}`;
        if (throwError) throw new Error('sw ' + errMassage);
        self.logError(errMassage);
      }
    }
    self.log('pre-cache complete');
  }

  /**
   * Прекеш в конкретный CacheItem(по его title и version)
   * и по заранее определенным для него precachePaths.
   */
  async predefinedPaths({strategy, title, version, timeout, throwError}: IPrecachePredefinedPaths): Promise<void> {
    const options = this.options.items.find(item => item.title === title) as ICacheItemOptions;
    const paths = options?.precachePaths;
    if (!paths || paths.length === 0)
      return;
    await this.runForItem({
      item: CacheItem.of(title, version, {match: options.match}),
      strategy, paths, timeout, throwError
    })
  }

  getItemsPrecachePaths(): string[] {
    return this.options.items
      .flatMap(item => item.precachePaths || [])
      .sort((a, b) => a.localeCompare(b));
  }
}
