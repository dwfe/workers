import {ICacheName, TCacheVersionReceivingMethod, TCacheVersionStore} from '../../сontract';
import {TCacheTitle} from '../cache.container';
import {CacheVersion} from './cache.version';

declare const self: IServiceWorkerGlobalScope;

/**
 * Реализуется формат имени кеша следующего вида:
 *
 *    scope:title:version
 *    [0]   [1]   [2]
 *
 *  scope   - так как к origin может быть привязано несколько сервис воркеров,
 *            то имя кеша начинается с self.SCOPE сервис воркера;
 *  title   - у одного сервис воркера может быть несколько подконтрольных ему кешей,
 *            поэтому имя дополняется названием контролируемой сущности;
 *  version - со временем кеш может устареть, поэтому в конце имени добавляется версия кеша;
 *  :       - разделитель.
 *
 * Например, такие имена:
 *    /:app:34.189.0.1
 *    /:tiles:v1
 *    /test: приложение : version 18
 */
export class CacheName implements ICacheName {
  static DELIMITER = ':';

  static of(title: TCacheTitle, store: TCacheVersionStore, receivingMethod?: TCacheVersionReceivingMethod): CacheName {
    const version = new CacheVersion(title, store, receivingMethod).get();
    return new CacheName(title, version);
  }

  value: string;

  constructor(public title: TCacheTitle,
              public version: string) {
    this.value = CacheName.get(title, version);
  }

  info() {
    return {
      scope: self.SCOPE,
      title: this.title,
      version: this.version
    };
  }

  static get(title: string, version: string): string {
    const d = CacheName.DELIMITER;
    return `${self.SCOPE}${d}${title}${d}${version}`;
  }

  static isValid(cacheName: string): boolean {
    const parsed = CacheName.parse(cacheName);
    return CacheName.isStructureValid(parsed) && parsed.scope === self.SCOPE;
  }

  static isStructureValid({scope, title, version, arr}): boolean {
    return arr.length === 3 && !!scope && !!title && !!version;
  }

  static parse(cacheName: string) {
    const arr = cacheName.split(CacheName.DELIMITER);
    return {
      scope: arr[0],
      title: arr[1],
      version: arr[2],
      arr
    };
  }

}
