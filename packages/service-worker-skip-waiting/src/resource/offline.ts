declare const self: IServiceWorkerGlobalScope;
import {IFetchData, TOffline, TOfflineNavigateReason} from '../сontract';
import {IServiceWorkerGlobalScope} from '../../types';
import {Exchange} from '../exchange/exchange';

export class Offline {
  isOffline: TOffline = null;
  byDataTimeoutId;

  get exchange(): Exchange {
    return self.env.exchange;
  }

  /**
   * Запрос данных с сервера может вернуть ошибку.
   * Это не значит, что мы сразу должны перейти в offline режим,
   * потому что, например, сразу же может отправиться и успешно вернуться запрос других данных.
   */
  setByData(): void {
    if (this.isOffline || this.byDataTimeoutId)
      return;
    this.byDataTimeoutId = setTimeout(() => {
      this.setOffline('byData');
    }, 3_000); // дать возможность отменить переход в offline режим
  }

  setByNavigate() {
    this.setOffline('byNavigate');
  }

  /**
   * Если хотя один запрос по сети прошел успешно
   */
  stop(): void {
    if (this.isOffline)
      this.setOffline(null);
  }

  async responseForNavigate(type: TOfflineNavigateReason, data: IFetchData): Promise<Response> {
    // let template: string;
    // switch (type){
    //   case '5xx':
    //     template = '/5xx.html';
    //     break;
    //   case 'catchError':
    //     template = '/catch-error.html';
    //     break;
    //   default:
    //     template = '/fallback.html';
    // }
    // return await self.env.cache.get('cache || fetch -> cache', Resource.fetchData(template));
    return new Response(); // навигация должна всегда возвращать статус 200 - требование гугла для PWA
  }

  setOffline(value: TOffline): void {
    if (this.byDataTimeoutId) {
      clearTimeout(this.byDataTimeoutId);
      this.byDataTimeoutId = null;
    }
    // console.log(`1 setOffline`, value)
    if (this.isOffline === null && value !== null) {
      this.exchange.send('OFFLINE_START');
      // TODO
      //  запустить интервальную проверку доступности сети
      //    - какой ресурс опрашивать?
    } else if (this.isOffline !== null && value === null) {
      this.exchange.send('OFFLINE_END');
      switch (this.isOffline) {
        case 'byData':
          break;
        case 'byNavigate':
          this.exchange.send('RELOAD_PAGE');
          break;
      }
    }
    this.isOffline = value;
    // console.log(`2 setOffline`, value)
  }

}
