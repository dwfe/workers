declare const self: IServiceWorkerGlobalScope;
import {CacheName} from './cache.name'

/**
 * Сущность, которая:
 *   - связана с конкретным кешем и умеет с ним работать
 *   - хранит дополнительную информацию об этом кеше
 */
export class CacheItem {
    constructor(public cacheName: CacheName,
                public pathStart?: string) {
    }

    /**
     * Стратегия "cache || fetch -> cache"
     * Поиск в кеше приложения:
     *   = найдено -> отдать браузеру
     *   = не найдено -> запросить сервер -> сохранить в кеш -> отдать браузеру
     */
    async get(key, req, pathname, throwError): Promise<Response | undefined> {
        const cache = await this.cache();
        return (
            (await cache.match(key)) ||
            fetch(req).then(resp => {
                if (resp.ok) {
                    cache.put(key, resp.clone());
                    this.log(pathname);
                    return resp;
                }
                const errMessage = `fetch '${pathname}', HTTP status: ${resp.status}`;
                if (throwError) throw new Error(errMessage);
                this.logError(errMessage);
            })
        );
    }

    cache(): Promise<Cache> {
        return self.caches.open(this.cacheName.value);
    }

    async info() {
        return {
            cacheName: this.cacheName.info(),
            length: await this.length()
        };
    }

    async length() {
        const keys = await this.cache().then(cache => cache.keys());
        return keys.length;
    }

    match(pathname): boolean {
        return this.pathStart ? pathname.startsWith(this.pathStart) : false;
    }

    log(...args) {
        self.log(`cache '${this.cacheName.value}'`, ...args);
    }

    logError(...args) {
        self.logError(`cache '${this.cacheName.value}'`, ...args);
    }
}
