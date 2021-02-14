declare const self: IServiceWorkerGlobalScope;
import {TCacheCleanStrategy} from './сontract';
import {CacheName} from './cache-name';
import {CacheSw} from './cache';

/**
 * Очищать кеш необходимо ввиду следующих причин:
 *   - может измениться формат имени кеша;
 *   - кеш может устареть (версия поменяется).
 *
 * Например, в какой-то момент времени может оказаться, что приложение хранит кеши с вот такими именами:
 *  const cacheNames = [
 *    "/:ap",
 *    "/:app:",
 *    "/:app:v222",
 *    "/:appchxi:v222",
 *    "/:app:v333",
 *    "/:app:v333:",
 *    "/:tiles:12",
 *    "/:tiles:v222",
 *    "/:tiles:v333",
 *    "/:tiles - v12",
 *    "v111",
 *    ":app:",
 *    "/test:tiles:v111",
 *    "Dfge73.32._sgjdsd",
 *    "",
 *    "/:тайлы:18",
 *    "мой кеш",
 *  ];
 */
export class CacheCleaner {

  constructor(private cache: CacheSw) {
  }

  async clean(strategy: TCacheCleanStrategy): Promise<void>  {
    self.log('cache cleaning…');

    let checkList = await this.remove(strategy);
    if (checkList.length) {
      // натыкался на кейс: иногда кеш не удаляется, а очищается, поэтому предпринимаю вторую попытку
      checkList = await this.remove(strategy);
      if (checkList.length) {
        checkList.forEach(cacheName =>
          self.logError(`can't delete cache '${cacheName}', 2 attempts were made`)
        );
      }
    }
    self.log('cache cleaning completed');
  }

  private async remove(strategy: TCacheCleanStrategy): Promise<string[]> {
    const badNames = await this.getBadNames(strategy);
    return Promise.all(
      badNames.map(cacheName => {
        self.log(`delete cache '${cacheName}'`);
        return self.caches.delete(cacheName);
      })
    ).then(() => this.getBadNames(strategy)); // если все удалилось, то список badNames должен быть пуст!
  }

  async getBadNames(strategy: TCacheCleanStrategy): Promise<string[]> {
    const cacheNames = await self.caches.keys();
    switch (strategy) {
      /**
       * Кеши, которые гарантированно не могут контролироваться данным sw.
       * ВНИМАНИЕ! Стратегия подойдет, если к origin привязан только один sw,
       *           иначе вы удалите кеш, принадлежащий другим sw этого origin
       */
      case 'not-controlled':
        const expectedTitleVersion = this.cache.items().map(
          item => item.cacheName.parsed.titleVersion
        );
        return cacheNames
          .map(cacheName => CacheName.parse(cacheName))
          .filter(
            parsed =>
              !CacheName.isStructureValid(parsed) ||
              parsed.scope !== self.SCOPE ||
              !expectedTitleVersion.includes(parsed.titleVersion)
          )
          .map(parsed => parsed.cacheName);
      default:
        const errMessage = `sw unknown strategy '${strategy}' of Cache.getValue(…)`;
        throw new Error(errMessage);
    }
  }
}
