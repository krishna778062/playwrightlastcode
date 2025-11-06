import {
  DatabaseType,
  getCurrentDatabaseType,
  getDbConfigFromCache,
  initializeDbConfig,
} from '@rewards/config/dbConfig';
import { getQuery } from '@rewards/utils/dbQuery';

import { Database, executeQuery } from '@core/utils/dbUtils';

/**
 * Database helper functions for reward module tests
 */
export class TestDatabaseHelper {
  /**
   * Get database configuration from cache
   * @param databaseType - Type of database ('reward' or 'recognition')
   * @returns Database configuration object
   */
  private static getDbConfig(databaseType: DatabaseType = 'reward') {
    initializeDbConfig(databaseType);
    try {
      const currentDbType = getCurrentDatabaseType();
      if (currentDbType !== databaseType) {
        throw new Error(
          `❌ Database config mismatch! Cache is initialized for '${currentDbType}' but requested '${databaseType}'. ` +
            `Call initializeDbConfig('${databaseType}') first.`
        );
      }
      return getDbConfigFromCache();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `❌ Database config not initialized for ${databaseType}. Call initializeDbConfig('${databaseType}') first.`
      );
    }
  }

  /**
   * Set distribution allowance as failed (for testing allowance refresh scenarios)
   */
  static async setDistributionAllowanceAsFailed(
    tenantCode: string,
    databaseType: DatabaseType = 'reward'
  ): Promise<void> {
    initializeDbConfig(databaseType);
    const dbConfig = this.getDbConfig(databaseType);
    const resultAsFailed = getQuery('setDistributionAllowanceAsFail');
    await executeQuery(resultAsFailed.replace('tenantCode', tenantCode), dbConfig.database, dbConfig);
  }

  /**
   * Set distribution allowance as success (for testing allowance refresh scenarios)
   */
  static async setDistributionAllowanceAsSuccess(
    tenantCode: string,
    databaseType: DatabaseType = 'reward'
  ): Promise<void> {
    initializeDbConfig(databaseType);
    const dbConfig = this.getDbConfig(databaseType);
    const resultAsSuccess = getQuery('setDistributionAllowanceAsSuccess');
    await executeQuery(resultAsSuccess.replace('tenantCode', tenantCode), dbConfig.database, dbConfig);
  }

  /**
   * Set the latest created date from allowance job record (for testing imported data scenarios)
   */
  static async setLatestCreatedDateFromAllowanceJobRecord(
    tenantCode: string,
    databaseType: DatabaseType = 'reward'
  ): Promise<void> {
    initializeDbConfig(databaseType);
    const dbConfig = this.getDbConfig(databaseType);
    const resultAsSuccess = getQuery('setTheLatestCreatedDateFromAllowanceJobRecord');
    await executeQuery(resultAsSuccess.replace(/tenantCode/g, tenantCode), dbConfig.database, dbConfig);
  }

  /**
   * Execute a custom query on the database
   */
  static async executeCustomQuery(
    query: string,
    tenantCode?: string,
    databaseType: DatabaseType = 'reward'
  ): Promise<any[]> {
    initializeDbConfig(databaseType);
    const dbConfig = this.getDbConfig(databaseType);
    const processedQuery = tenantCode ? query.replace(/tenantCode/g, tenantCode) : query;
    return await executeQuery(processedQuery, dbConfig.database, dbConfig);
  }

  /**
   * get the record of users which currency is set to null
   */
  static async getTheUserCountWhichCurrencyIsNull(
    tenantCode: string,
    databaseType: DatabaseType = 'reward'
  ): Promise<void> {
    initializeDbConfig(databaseType);
    const dbConfig = this.getDbConfig(databaseType);
    const resultAsSuccess = getQuery('getTheEmailOfUsersWhichCurrencyIsNull');
    await executeQuery(resultAsSuccess.replace(/tenantCode/g, tenantCode), dbConfig.database, dbConfig);
  }

  /**
   * Get a database instance for complex operations
   */
  static getDatabaseInstance(databaseType: DatabaseType = 'reward'): Database {
    initializeDbConfig(databaseType);
    const dbConfig = this.getDbConfig(databaseType);
    return new Database(dbConfig.database, dbConfig);
  }

  /**
   * Execute multiple database operations in sequence
   */
  static async executeMultipleOperations(
    operations: Array<{
      type:
        | 'setDistributionAllowanceAsFailed'
        | 'setDistributionAllowanceAsSuccess'
        | 'setLatestCreatedDateFromAllowanceJobRecord'
        | 'custom';
      query?: string;
      tenantCode: string;
      databaseType?: DatabaseType;
    }>,
    defaultDatabaseType: DatabaseType = 'reward'
  ): Promise<void> {
    initializeDbConfig(defaultDatabaseType);
    for (const operation of operations) {
      const databaseType = operation.databaseType || defaultDatabaseType;
      switch (operation.type) {
        case 'setDistributionAllowanceAsFailed':
          await this.setDistributionAllowanceAsFailed(operation.tenantCode, databaseType);
          break;
        case 'setDistributionAllowanceAsSuccess':
          await this.setDistributionAllowanceAsSuccess(operation.tenantCode, databaseType);
          break;
        case 'setLatestCreatedDateFromAllowanceJobRecord':
          await this.setLatestCreatedDateFromAllowanceJobRecord(operation.tenantCode, databaseType);
          break;
        case 'custom':
          if (operation.query) {
            await this.executeCustomQuery(operation.query, operation.tenantCode, databaseType);
          }
          break;
      }
    }
  }
}

/**
 * Convenience functions for common test scenarios
 */
export const TestDbScenarios = {
  /**
   * Setup allowance refresh scenario (set as failed)
   */
  async setupAllowanceRefresh(tenantCode: string, databaseType: DatabaseType = 'reward'): Promise<void> {
    initializeDbConfig(databaseType);
    await TestDatabaseHelper.setDistributionAllowanceAsFailed(tenantCode, databaseType);
  },

  /**
   * Cleanup allowance refresh scenario (set as success)
   */
  async cleanupAllowanceRefresh(tenantCode: string, databaseType: DatabaseType = 'reward'): Promise<void> {
    initializeDbConfig(databaseType);
    await TestDatabaseHelper.setDistributionAllowanceAsSuccess(tenantCode, databaseType);
  },

  /**
   * Setup imported data scenario
   */
  async setupImportedData(tenantCode: string, databaseType: DatabaseType = 'reward'): Promise<void> {
    initializeDbConfig(databaseType);
    await TestDatabaseHelper.setLatestCreatedDateFromAllowanceJobRecord(tenantCode, databaseType);
  },

  async getAllTheUsersCountWhichHaveCurrencyAsNull(
    tenantCode: string,
    databaseType: DatabaseType = 'reward'
  ): Promise<any> {
    initializeDbConfig(databaseType);
    await TestDatabaseHelper.getTheUserCountWhichCurrencyIsNull(tenantCode, databaseType);
  },
};
