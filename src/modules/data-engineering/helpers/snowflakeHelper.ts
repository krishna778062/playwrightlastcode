import { SnowflakeService } from '@data-engineering/api/services/SnowflakeService';

/**
 * Helper class for interacting with Snowflake using the SnowflakeService.
 *
 * Example usage:
 *
 *   // For one-off query:
 *   const result = await SnowflakeHelper.runQuery('SELECT * FROM my_table');
 *
 *   // For multiple queries in a session:
 *   const helper = new SnowflakeHelper();
 *   await helper.connect(); // Only connects if not already connected
 *   const rows = await helper.execute('SELECT * FROM my_table');
 *   await helper.destroy(); // Only destroys if connected
 *
 * Note: For best performance, initialize and connect once before your test(s),
 * reuse the helper for multiple queries, and destroy in teardown/afterAll.
 */
export class SnowflakeHelper {
  private snowflake: SnowflakeService;
  private connected = false;

  /**
   * Initializes a new SnowflakeHelper instance using environment configuration.
   */
  constructor() {
    this.snowflake = SnowflakeService.fromEnv();
  }

  /**
   * Establishes a connection to Snowflake if not already connected.
   *
   * @example
   *   const helper = new SnowflakeHelper();
   *   await helper.connect();
   */
  async connect() {
    if (!this.connected) {
      await this.snowflake.connect();
      this.connected = true;
    }
  }

  /**
   * Executes a SQL query and returns the result as an array of objects.
   * Ensures connection is established before executing.
   *
   * @param sql - The SQL query string to execute.
   * @returns Promise resolving to an array of result rows.
   *
   * @example
   *   const rows = await helper.execute('SELECT * FROM my_table');
   */
  async execute<T = any>(sql: string): Promise<T[]> {
    if (!this.connected) {
      await this.connect();
    }
    return this.snowflake.execute<T>(sql);
  }

  /**
   * Closes the Snowflake connection if connected.
   *
   * @example
   *   await helper.destroy();
   */
  async destroy() {
    if (this.connected) {
      await this.snowflake.destroy();
      this.connected = false;
    }
  }

  /**
   * Utility for running a one-off query: connects, executes, and disconnects automatically.
   *
   * @param sql - The SQL query string to execute.
   * @returns Promise resolving to an array of result rows.
   *
   * @example
   *   const result = await SnowflakeHelper.runQuery('SELECT * FROM my_table');
   */
  static async runQuery<T = any>(sql: string): Promise<T[]> {
    const helper = new SnowflakeHelper();
    await helper.connect();
    const result = await helper.execute<T>(sql);
    await helper.destroy();
    return result;
  }

  /**
   * Runs SQL by key and returns the result.
   * Handles placeholder substitution using env or provided overrides.
   */
  static async getDataForSqlQuery(rawSql: string): Promise<string | number> {
    const orgId = process.env.ORG_ID;
    if (!orgId) {
      throw new Error('ORG_ID env variable must be defined for DB validation');
    }

    const sql = rawSql.replace(/'orgId'/g, `'${orgId}'`);

    const rows = await SnowflakeHelper.runQuery<Record<string, any>>(sql);
    if (!rows.length) {
      throw new Error('Snowflake returned no rows');
    }
    const firstRow = rows[0] ?? {};
    const dbRaw = Object.values(firstRow)[0];
    return dbRaw;
  }
}
