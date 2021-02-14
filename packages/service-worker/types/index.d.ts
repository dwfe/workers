interface IServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
    APP_VERSION: string;
    TILES_VERSION: string;

    SCOPE: string;
    isDebug: boolean;

    Cache: any;
    Exchange: any;
    log: (...args) => void;
    logError: (...args) => void;
    delay: (ms: number) => Promise<void>;
}




