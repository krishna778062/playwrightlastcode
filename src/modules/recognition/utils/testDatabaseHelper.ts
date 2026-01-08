import { expect } from '@playwright/test';
import { DatabaseType, getDbConfigFromCache, initializeDbConfig } from '@recognition/config/dbConfig';
import { getQuery } from '@recognition/utils/dbQuery';

import { Database } from '@core/utils/dbUtils';

/**
 * Database helper functions for recognition module tests
 */
export class TestDatabaseHelper {
  /**
   * Get database configuration from cache
   * @param databaseType - Type of database ('recognition')
   * @returns Database configuration object
   */
  private static getDbConfig(databaseType: DatabaseType = 'recognition') {
    initializeDbConfig(databaseType);
    try {
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

  static async getNominationsByAwardId(
    tenantCode: string,
    awardId: string,
    databaseType: DatabaseType = 'recognition'
  ): Promise<any[]> {
    const dbConfig = this.getDbConfig(databaseType);
    const getNominationsByAwardIdQuery = getQuery('getNominationsByAwardId');

    const query = getNominationsByAwardIdQuery.replace(/{{tenantCode}}/g, tenantCode).replace(/{{awardId}}/g, awardId);

    const result = await this.executeWithConfig(query, dbConfig);
    console.log('result', result);
    console.log('result length', result.length);
    return result;
  }

  static async getNominationInstancesByNominationId(
    tenantCode: string,
    nominationId: string,
    databaseType: DatabaseType = 'recognition'
  ): Promise<any[]> {
    const dbConfig = this.getDbConfig(databaseType);
    const getNominationInstancesByNominationIdQuery = getQuery('getNominationInstancesByNominationId');

    const query = getNominationInstancesByNominationIdQuery
      .replace(/{{tenantCode}}/g, tenantCode)
      .replace(/{{nominationId}}/g, nominationId);

    const result = await this.executeWithConfig(query, dbConfig);
    console.log('result', result);
    console.log('result length', result.length);
    return result;
  }

  static async updateNominationInstanceByNominationId(
    tenantCode: string,
    nominationId: string,
    {
      opensAt,
      closesAt,
      status,
      overduesAt,
    }: {
      opensAt?: string;
      closesAt?: string;
      status?: string;
      overduesAt?: string;
    },
    databaseType: DatabaseType = 'recognition'
  ): Promise<void> {
    const updates: string[] = [];
    const addIfPresent = (column: string, value: string | undefined) => {
      if (value !== undefined) {
        updates.push(`"${column}" = '${value}'`);
      }
    };

    addIfPresent('opensAt', opensAt);
    addIfPresent('closesAt', closesAt);
    addIfPresent('status', status);
    addIfPresent('overduesAt', overduesAt);

    if (updates.length === 0) {
      throw new Error('At least one field must be provided to update NominationInstance');
    }

    const dbConfig = this.getDbConfig(databaseType);
    const updateTemplate = getQuery('updateNominationInstanceByNominationId');
    const setClause = updates.join(', ');

    const query = updateTemplate
      .replace('{setClause}', setClause)
      .replace(/{{tenantCode}}/g, tenantCode)
      .replace(/{{nominationId}}/g, nominationId);

    const result = await this.executeWithConfig(query, dbConfig);
    console.log('updateNominationInstanceByNominationId result', result);
  }

  /**
   * Execute a query using the provided DB config.
   * Uses Database class to avoid signature mismatches across environments.
   */
  private static async executeWithConfig(query: string, dbConfig: { database: string }): Promise<any[]> {
    const db = new Database(dbConfig.database, dbConfig);
    await db.connect();
    try {
      return await db.executeQuery(query);
    } finally {
      await db.close();
    }
  }
}

/**
 * Convenience functions for common test scenarios
 */
export const TestDbScenarios = {
  async getNominationsByAwardId(
    tenantCode: string,
    awardId: string,
    databaseType: DatabaseType = 'recognition'
  ): Promise<void> {
    initializeDbConfig(databaseType);
    await TestDatabaseHelper.getNominationsByAwardId(tenantCode, awardId, databaseType);
  },

  async getNominationInstancesDataFromDBByNominationId(
    tenantCode: string,
    nominationId: string,
    databaseType: DatabaseType = 'recognition'
  ): Promise<any[]> {
    initializeDbConfig(databaseType);
    const nominationInstanceData = await TestDatabaseHelper.getNominationInstancesByNominationId(
      tenantCode,
      nominationId,
      databaseType
    );
    return nominationInstanceData;
  },

  async updateNominationInstanceByNominationId(
    tenantCode: string,
    nominationId: string,
    updates: {
      opensAt?: string;
      closesAt?: string;
      status?: string;
      overduesAt?: string;
    },
    databaseType: DatabaseType = 'recognition'
  ): Promise<void> {
    initializeDbConfig(databaseType);
    await TestDatabaseHelper.updateNominationInstanceByNominationId(tenantCode, nominationId, updates, databaseType);
  },

  async checkAwardStatusInDBByNominationId(
    tenantCode: string,
    nominationId: string,
    expectedAwardStatus: string,
    iteration?: number,
    databaseType: DatabaseType = 'recognition'
  ): Promise<void> {
    initializeDbConfig(databaseType);
    const nominationInstanceData = await TestDbScenarios.getNominationInstancesDataFromDBByNominationId(
      tenantCode,
      nominationId
    );
    console.log('nominationInstanceData received from DB is:-', nominationInstanceData);
    if (!Array.isArray(nominationInstanceData) || nominationInstanceData.length === 0) {
      throw new Error(`No nomination instances found for nomination id ${nominationId}`);
    }
    const match =
      iteration !== undefined
        ? nominationInstanceData.find((item: any) => item.iteration === iteration)
        : nominationInstanceData[0];
    if (!match) {
      throw new Error(`No nomination instance found for nomination id ${nominationId} with iteration ${iteration}`);
    }
    console.log('Award status from database (matched):', match.status);
    expect(match.status).toBe(expectedAwardStatus);
  },
};
