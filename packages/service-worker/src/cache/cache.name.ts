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
 *    /test: приложение:version 18
 */
export class CacheName {
  static DELIMITER = ":";

  value: string;
  parsed;

  constructor(public title: string, public version: string) {
    this.value = CacheName.get(title, version);
    this.parsed = CacheName.parse(this.value);
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

  static parse(cacheName: string) {
    const arr = cacheName.split(CacheName.DELIMITER);
    const scope = arr[0];
    const title = arr[1];
    const version = arr[2];
    return {
      scope,
      title,
      version,
      arr,
      cacheName,
      titleVersion: `${title}${CacheName.DELIMITER}${version}`
    };
  }

  static isValid(cacheName): boolean {
    const parsed = CacheName.parse(cacheName);
    return CacheName.isStructureValid(parsed);
  }

  static isStructureValid({ scope, title, version, arr }): boolean {
    return arr.length === 3 && !!scope && !!title && !!version;
  }
}