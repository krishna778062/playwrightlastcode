import { getQuery } from '@rewards/utils/dbQuery';

import { Database, executeQuery } from '@core/utils/dbUtils';

/**
 * Database helper functions for reward module tests
 */
export class TestDatabaseHelper {
  /**
   * Set distribution allowance as failed (for testing allowance refresh scenarios)
   */
  static async setDistributionAllowanceAsFailed(tenantCode: string): Promise<void> {
    const resultAsFailed = getQuery('setDistributionAllowanceAsFail');
    await executeQuery(resultAsFailed.replace('tenantCode', tenantCode), 'reward');
  }

  /**
   * Set distribution allowance as success (for testing allowance refresh scenarios)
   */
  static async setDistributionAllowanceAsSuccess(tenantCode: string): Promise<void> {
    const resultAsSuccess = getQuery('setDistributionAllowanceAsSuccess');
    await executeQuery(resultAsSuccess.replace('tenantCode', tenantCode), 'reward');
  }

  /**
   * Set the latest created date from allowance job record (for testing imported data scenarios)
   */
  static async setLatestCreatedDateFromAllowanceJobRecord(tenantCode: string): Promise<void> {
    const resultAsSuccess = getQuery('setTheLatestCreatedDateFromAllowanceJobRecord');
    await executeQuery(resultAsSuccess.replace(/tenantCode/g, tenantCode), 'reward');
  }

  /**
   * Execute a custom query on the reward database
   */
  static async executeCustomQuery(query: string, tenantCode?: string): Promise<any[]> {
    const processedQuery = tenantCode ? query.replace(/tenantCode/g, tenantCode) : query;
    return await executeQuery(processedQuery, 'reward');
  }

  /**
   * get the record of users which currency is set to null
   */
  static async getTheUserCountWhichCurrencyIsNull(tenantCode: string): Promise<void> {
    const resultAsSuccess = getQuery('getTheEmailOfUsersWhichCurrencyIsNull');
    await executeQuery(resultAsSuccess.replace(/tenantCode/g, tenantCode), 'reward');
  }

  /**
   * Get a database instance for complex operations
   */
  static getDatabaseInstance(): Database {
    return new Database('reward');
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
    }>
  ): Promise<void> {
    for (const operation of operations) {
      switch (operation.type) {
        case 'setDistributionAllowanceAsFailed':
          await this.setDistributionAllowanceAsFailed(operation.tenantCode);
          break;
        case 'setDistributionAllowanceAsSuccess':
          await this.setDistributionAllowanceAsSuccess(operation.tenantCode);
          break;
        case 'setLatestCreatedDateFromAllowanceJobRecord':
          await this.setLatestCreatedDateFromAllowanceJobRecord(operation.tenantCode);
          break;
        case 'custom':
          if (operation.query) {
            await this.executeCustomQuery(operation.query, operation.tenantCode);
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
  async setupAllowanceRefresh(tenantCode: string): Promise<void> {
    await TestDatabaseHelper.setDistributionAllowanceAsFailed(tenantCode);
  },

  /**
   * Cleanup allowance refresh scenario (set as success)
   */
  async cleanupAllowanceRefresh(tenantCode: string): Promise<void> {
    await TestDatabaseHelper.setDistributionAllowanceAsSuccess(tenantCode);
  },

  /**
   * Setup imported data scenario
   */
  async setupImportedData(tenantCode: string): Promise<void> {
    await TestDatabaseHelper.setLatestCreatedDateFromAllowanceJobRecord(tenantCode);
  },

  async getAllTheUsersCountWhichHaveCurrencyAsNull(tenantCode: string): Promise<any> {
    await TestDatabaseHelper.getTheUserCountWhichCurrencyIsNull(tenantCode);
  },
};
