declare const self: IServiceWorkerGlobalScope;
import {TCacheVersionReceivingMethod, TCacheVersionStore} from '../../сontract';
import {IServiceWorkerGlobalScope} from '../../../types';
import {TCacheTitle} from '../cache.container';

/**
 * Варианты хранения версии конкретного кеша:
 *  'self'      - версия задается в переменную контекста self, например, в файле sw.js
 *  'IndexedDB' - версия хранится в IndexedDB
 */
export class CacheVersion {

  constructor(public title: TCacheTitle,
              public store: TCacheVersionStore,
              public receivingMethod?: TCacheVersionReceivingMethod) {
  }

  get(): string {
    switch (this.store) {
      case 'self':
        return this.fromSelf();
      case 'IndexedDB':
        return this.fromIndexedDB();
      default:
        throw new Error(`sw unknown cache version store '${this.store}'`);
    }
  }

  fromSelf(): string {
    let version, varName;
    switch (this.title) {
      case 'app':
        varName = 'APP_VERSION'
        break;
      case 'tiles':
        varName = 'TILES_VERSION';
        break;
      default:
        throw new Error(`sw unknown cache title '${this.title}' of CacheVersion.fromSelf(…)`);
    }
    version = self[varName];
    if (version) return version;
    throw new Error(`sw can't get cache version for title '${this.title}' from self.${varName}`);
  }

  fromIndexedDB(): string {
    let version;
    switch (this.title) {
      case 'app':
        // version = await fetch();
        break;
      case 'tiles':
        // version = await fetch();
        break;
      default:
        throw new Error(`sw unknown cache title '${this.title}' of CacheVersion.fromIndexedDB(…)`);
    }
    if (version) return version;
    throw new Error(`sw can't get cache version for title '${this.title}' from IndexedDB`);
  }

}
