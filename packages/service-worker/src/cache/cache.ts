declare const self: IServiceWorkerGlobalScope;
import {ICacheItemsContainer, TCacheCleanStrategy, TGetFromCacheStrategy} from './сontract'
import {CacheContainer} from './cache.container'
import {CacheCleaner} from './cache.cleaner';
import {CacheItem} from './cache.item';

/**
 * - знает обо всех кешах приложения
 * - умеет получать/сохранять/обслуживать данные этих кешей
 */
export class CacheSw {

    container: ICacheItemsContainer;
    cleaner: CacheCleaner;

    constructor(public controlExtentions: string[]) {
        this.container = new CacheContainer();
        this.cleaner = new CacheCleaner(this);
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
        return this.container.item(pathname);
    }

    items(): CacheItem[] {
        return this.container.items();
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
            this.container.match(pathname)
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

    clean(strategy: TCacheCleanStrategy): Promise<void>  {
        return this.cleaner.clean(strategy);
    }

}
