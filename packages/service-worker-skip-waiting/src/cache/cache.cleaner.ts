declare const self: IServiceWorkerGlobalScope;
import {ICacheCleaner, TCacheCleanStrategy} from '../сontract';
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
export class CacheCleaner implements ICacheCleaner {
  constructor(private cache: CacheSw) {
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
    self.log('cache cleaning completed');
  }

  async tryToDelete(strategy: TCacheCleanStrategy, attemptsCount: number): Promise<string[]> {
    let cacheNames = await this.findToDelete(strategy);
    while (attemptsCount >= 1) {
      if (cacheNames.length === 0) return cacheNames;
      await this.delete(cacheNames);
      cacheNames = await this.findToDelete(strategy);
      attemptsCount--;
    }
    return cacheNames;
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
      case 'uncontrolled':
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
