declare const self: IServiceWorkerGlobalScope;
import {TCacheClearStrategy, TGetFromCacheStrategy} from './сontract'
import {CacheName} from './cache-name';
import {CacheItem} from './cache-item';

/**
 * - знает обо всех кешах приложения
 * - умеет получать/сохранять/обслуживать данные этих кешей
 */
export class CacheSw {

    app: CacheItem;
    tiles: CacheItem;

    constructor(public controlExtentions: string[]) {
        const appCacheName = new CacheName('app', self.APP_VERSION);
        this.app = new CacheItem(appCacheName);

        const tilesCacheName = new CacheName('tiles', self.TILES_VERSION);
        this.tiles = new CacheItem(tilesCacheName, '/tiles');
    }

    async get(strategy: TGetFromCacheStrategy, key, req, pathname, throwError = false): Promise<Response | undefined> {
        const cacheItem = this.item(pathname);
        switch (strategy) {
            case 'cache || fetch -> cache':
                return cacheItem.get(key, req, pathname, throwError);
            default:
                const errMessage = `sw unknown strategy '${strategy}' of Cache.getValue(…)`;
                throw new Error(errMessage);
        }
    }

    item(pathname): CacheItem {
        if (this.tiles.match(pathname)) return this.tiles;
        return this.app;
    }

    items(): CacheItem[] {
        return [this.app, this.tiles];
    }

    getInfo(): Promise<any> {
        return Promise.all(this.items().map(item => item.info()));
    }

    isControl(url): boolean {
        if (url.origin !== self.location.origin) return false;
        const pathname = url.pathname;

        if (pathname.includes('sw.js') || pathname.includes('index.html'))
            return false;
        else if (
            pathname.startsWith('/static') ||
            pathname.startsWith('/fonts') ||
            this.tiles.match(pathname)
        )
            return true;
        const ext = pathname.split('.').pop();
        return this.controlExtentions.includes(ext);
    }

    async precache(strategy: TGetFromCacheStrategy, pathnames, throwError = false): Promise<void> {
        self.log(`pre-caching [${pathnames.length}] files…`);
        await Promise.all(
            pathnames.map(pathname =>
                this.get(strategy, pathname, pathname, pathname, throwError)
            )
        );
        self.log('pre-caching completed');
    }

    //region Clear cache

    /**
     * Очищать кеш необходимо ввиду следующих причин:
     *   - может измениться формат имени кеша;
     *   - кеш может устареть (версия поменяется).
     *
     * Например, в какой-то момент времени может оказаться, что приложение хранит кеши с вот такими именами:
     var cacheNames = [
     "/:ap",
     "/:app:",
     "/:app:v222",
     "/:appchxi:v222",
     "/:app:v333",
     "/:app:v333:",
     "/:tiles:12",
     "/:tiles:v222",
     "/:tiles:v333",
     "/:tiles - v12",
     "v111",
     ":app:",
     "/test:tiles:v111",
     "Dfge73.32._sgjdsd",
     "",
     "/:тайлы:18",
     "мой кеш",
     ]
     */
    async clear(strategy: TCacheClearStrategy): Promise<void>  {
        self.log('cache clearing…');

        let checkList = await this.deleteByStrategy(strategy);
        if (checkList.length) {
            // натыкался на кейс: иногда кеш не удаляется, а очищается, поэтому предпринимаю вторую попытку
            checkList = await this.deleteByStrategy(strategy);
            if (checkList.length) {
                checkList.forEach(name =>
                    self.logError(`can't delete cache '${name}', 2 attempts were made`)
                );
            }
        }
        self.log('cache clearing completed');
    }

    async deleteByStrategy(strategy: TCacheClearStrategy): Promise<string[]> {
        const badNames = await this.getBadNames(strategy);
        return Promise.all(
            badNames.map(cacheName => {
                self.log(`delete cache '${cacheName}'`);
                return self.caches.delete(cacheName);
            })
        ).then(() => this.getBadNames(strategy)); // если все удалилось, то список BadNames должен быть пуст!
    }

    async getBadNames(strategy: TCacheClearStrategy): Promise<string[]> {
        const cacheNames = await self.caches.keys();
        switch (strategy) {
            /**
             * Кеши, которые гарантированно не могут контролироваться данным sw.
             * ВНИМАНИЕ! Стратегия подойдет, если к origin привязан только один sw,
             *           иначе вы удалите кеш, принадлежащий другим sw этого origin
             */
            case 'not-controlled':
                const expectedTitleVersion = this.items().map(
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

    //endregion
}
