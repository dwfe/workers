declare const self: IServiceWorkerGlobalScope;
import {BrowserFetchData, IFetchData, TGetStrategy, TOfflineNavigateReason} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {Cache} from '../cache/cache';
import {Offline} from './offline';

/**
 * Все что связано с получением ресурсов с сервера
 */
export class Resource {
  offline: Offline;

  constructor() {
    this.offline = new Offline();
  }

  /**
   * Любой запрос данных по сети должен использовать один и тот же вызов fetch.
   * Такой подход позволяет, например, контролировать переход в/из режима offline.
   */
  fetch(data: IFetchData): Promise<Response> {
    const {req, url, timeout, init} = data;
    return (timeout
        ? self.timeout(timeout, fetch(req, init))
        : fetch(req, init)
    )
      .then((resp: Response) => {
        if (resp.status >= 500 && resp.status <= 599) {
          self.logError(`fetch '${Resource.path(url)}', status: ${resp.status}`);
          if (Resource.isNavigate(req)) // 5xx при навигации - это очень близко к offline
            return this.offlineByNavigate('5xx', data);
          else {
            /**
             * ЕСЛИ при запросе данных сервер вернул статус 5xх ТО это не значит, что клиент offline.
             * Сеть есть, но произошел какой-то сбой на сервере при обработке этого запроса.
             * TODO
             *   Несмотря на то, что статус 5xx не является ошибкой, при обработке ответа
             *   с таким статусом браузер выбросит ошибку "Uncaught (in promise)".
             *   Может быть есть смысл как-то реагировать на некоторые из 5xx статусов.
             *   Например, на "503" - зачастую причинами являются отключение сервера или то, что он перегружен.
             */
          }
        }
        this.offline.stop();
        return resp;
      })
      .catch(err => {
        self.logError(`fetch '${Resource.path(url)}': ${err.message}`);
        if (Resource.isNavigate(req))
          return this.offlineByNavigate('catchError', data);
        this.offline.setByData();
        throw new Error(err.message);
      });
  }

  /**
   * @return Response в статусе 200-299, либо throw Error
   */
  fetchStrict(data: IFetchData): Promise<Response> {
    return this.fetch(data)
      .then(resp => {
        if (resp.ok) return resp;
        throw new Error(`fetch '${Resource.path(data.url)}', status: ${resp.status}`);
      });
  }

  static fetchData(req: RequestInfo, timeout = 30_000, init?: RequestInit): IFetchData {
    return {
      req,
      url: Resource.url(req),
      timeout,
      init,
    }
  }

  private offlineByNavigate(type: TOfflineNavigateReason, data: IFetchData): Promise<Response> {
    this.offline.setByNavigate();
    return this.offline.responseForNavigate(type, data);
  }


//region Получить ресурс, когда его запрашивает браузер

  async forBrowser(req: Request): Promise<Response | undefined> {
    const {strategy, data} = this.browserFetchData(req);
    return strategy === 'fetch'
      ? this.fetch(data)
      : this.cache.get(strategy, data);
  }

  browserFetchData(req: Request): BrowserFetchData {
    let strategy: TGetStrategy = 'fetch'; // по умолчанию все запросы браузера идут напрямую к серверу
    let data = Resource.fetchData(req);
    if (req.mode === 'navigate') {
      const isNavigateToSlide = /^\/[\w\d\-\_\=]*$/.test(data.url.pathname); // pathname вида: "/pJqy8O-IVlc=", "/2443"
      if (isNavigateToSlide) {
        data = Resource.fetchData('/index.html'); // все слайды получают один и тот же index.html
        strategy = 'fetch -> cache || cache'; // по возможности всегда обновлять index.html
      } else
        strategy = 'fetch'; // любая навигация не по слайдам идет напрямую к серверу
    } else if (req.method === 'GET' && this.cache.isControl(data.url)) {
      strategy = 'cache || fetch -> cache';
    }
    return {strategy, data};
  }

  get cache(): Cache {
    return self.env.cache;
  }

//endregion


//region Support

  /**
   * Запросить можно двумя путями:
   *   1) Request - объект Request, его обычно гененрирует браузер;
   *   2) string  - например: - http://mysite.ru/static/resize-observer.min.js
   *                          -                 /static/resize-observer.min.js
   *                          -                  static/resize-observer.min.js
   * @return либо Request,
   *         либо строка вида "http://mysite.ru/static/resize-observer.min.js"
   */
  static normalizeRequest(req: RequestInfo): RequestInfo {
    if (typeof req === 'string') {
      const hasProtocol = req.includes('http:') || req.includes('https:');
      if (!hasProtocol) {
        req = req[0] === '/' ? req : `/${req}`; // добавить, при отсутствии, слеш в начало
        req = self.location.origin + req;
      }
      return req;
    }
    return req;
  }

  static url(req: RequestInfo): URL {
    req = Resource.normalizeRequest(req);
    return typeof req === 'string'
      ? new URL(req)
      : new URL(req.url)
  }

  static path = (url: URL): string => `${url.pathname}${url.search}${url.hash}`;

  static requestModeLog(req: RequestInfo): string {
    return typeof req === 'string'
      ? ''
      : ` mode '${req.mode}'`
  }

  static isNavigate = (req: RequestInfo): boolean =>
    req instanceof Request && req.mode === 'navigate'
  ;

//endregion

}
