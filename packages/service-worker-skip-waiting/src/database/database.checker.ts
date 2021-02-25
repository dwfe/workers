import {IDatabaseCheckResult, ISwEnvOptions} from '../сontract';
import {DatabaseController} from './database.controller';

export class DatabaseChecker {

  constructor(private dbController: DatabaseController,
              private options: ISwEnvOptions) {
  }

  async run(): Promise<IDatabaseCheckResult> {
    const result: IDatabaseCheckResult = {};

    if (this.dbController.isAllStoresExists()) {
      result.upgradeNeeded = await this.isDbUpgradeNeeded();
      result.dbVersionStoreInitNeeded = await this.isDbVersionStoreInitNeeded()
      result.cacheVersionStoreFetchNeeded = await this.isCacheVersionStoreFetchNeeded();
    } else {
      /**
       * DB должна содержать предопределенные хранилища.
       * Если нет, то необходимо их создать и заполнить.
       */
      result.upgradeNeeded = true;
      result.dbVersionStoreInitNeeded = true;
      result.cacheVersionStoreFetchNeeded = true;
    }
    return result;
  }

  async isDbUpgradeNeeded(): Promise<boolean> {
    /**
     * Если в настройках указана версия и она больше
     * версии из хранилища, тогда надо проапгрейдить db
     */
    const dbVersion = await this.dbController.getDbVersion() || 1;
    return this.dbController.database.optDbVersion > dbVersion;
  }

  async isDbVersionStoreInitNeeded(): Promise<boolean> {
    const dbVersion = await this.dbController.getDbVersion()
    return dbVersion === undefined;
  }

  async isCacheVersionStoreFetchNeeded(): Promise<boolean> {
    if (!this.options.cache)
      throw new Error(`sw database check can't find cache options`);
    const expected = this.options.cache?.items.map(dto => dto.title)
    for (let i = 0; i < expected.length; i++) {
      const version = await this.dbController.getCacheVersion(expected[i]);
      if (version === undefined)
        return true;
    }
    return false;
  }

}
