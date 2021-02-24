import {Database} from '../database/database';
import {IDatabaseHandler} from '../сontract';
import {Cache} from './cache';

export class CacheDatabaseHandler implements IDatabaseHandler {

  versionStoreName: string | undefined;

  constructor(private cache: Cache,
              private database: Database | undefined) {
    this.versionStoreName = this.cache.options.version?.storeName;
  }

  onupgradeneeded(db: IDBDatabase, {oldVersion, newVersion}: IDBVersionChangeEvent): any {
    if (this.versionStoreName && !db.objectStoreNames.contains(this.versionStoreName)) {
      db.createObjectStore(this.versionStoreName);
    }
  }


//region Хранилище версий кешей

  async getVersion(title: string): Promise<any | undefined> {
    return this.versionDBAction('get', title);
  }

  async putVersion(title: string, version: string): Promise<IDBValidKey> {
    return this.versionDBAction('put', title, version);
  }

  private versionDBAction(action: 'get' | 'put', title: string, version?: string) {
    if (!this.versionStoreName)
      throw new Error('version storeName is undefined');
    if (!title)
      throw new Error(`invalid title '${title}'`);

    switch (action) {
      case 'get':
        return this.database?.get(this.versionStoreName, title);
      case 'put':
        if (!version)
          throw new Error(`invalid version '${version}'`);
        return this.database?.put(this.versionStoreName, version, title);
    }
  }

//endregion

}
