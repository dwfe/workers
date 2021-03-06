declare const self: IServiceWorkerGlobalScope;
import {ICacheCleaner, TCacheCleanStrategy} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {Cache} from './cache';

/**
 * Очищать кеши необходимо ввиду следующих причин:
 *   - кеш может устареть (версия поменяется);
 *   - может измениться формат имени кеша.
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
export class CacheCleaner implements ICacheCleaner {
  constructor(private cache: Cache) {
  }

  async clean(strategy: TCacheCleanStrategy): Promise<void> {
    self.log(`cache cleaning by '${strategy}' strategy…`);

    // натыкался на кейс: кеш(который должен был удалиться) остается в списке, но внутри он пустой.
    // при этом браузер не сообщил об ошибке. Поэтому предпринимаю несколько попыток
    const attemptsCount = 2;
    await this.tryToDelete(strategy, attemptsCount).then(cacheNames =>
      cacheNames.forEach(cacheName =>
        self.logError(`can't delete cache '${cacheName}', ${attemptsCount} attempts were made`)
      )
    );
    self.log('cache cleaning complete');
  }

  async tryToDelete(strategy: TCacheCleanStrategy, attemptsCount: number): Promise<string[]> {
    let namesToDelete = await this.findToDelete(strategy);
    while (attemptsCount >= 1) {
      if (namesToDelete.length === 0) return namesToDelete;
      await this.delete(namesToDelete);
      namesToDelete = await this.findToDelete(strategy);
      attemptsCount--;
    }
    return namesToDelete;
  }

  async findToDelete(strategy: TCacheCleanStrategy): Promise<string[]> {
    const cacheNames = await self.caches.keys();
    const expected = this.cache.items().map(item => item.cacheName.value);
    switch (strategy) {
      /**
       * Вычисляет имена кешей, которые гарантированно неподконтрольны данному sw.
       * ВНИМАНИЕ! Стратегия подойдет, если к origin привязан только один sw,
       *           иначе возможно удаление кеша, принадлежащего другому sw этого origin
       */
      case 'delete-uncontrolled':
        return cacheNames.filter(cacheName => !expected.includes(cacheName));
      default:
        throw new Error(`sw unknown strategy '${strategy}' of CacheCleaner.findToDelete(…)`);
    }
  }

  async delete(cacheNames: string[]) {
    if (!cacheNames.length) return;
    return Promise.all(
      cacheNames.map(cacheName => {
        self.log(`delete cache '${cacheName}'`);
        return self.caches.delete(cacheName);
      })
    );
  }
}
