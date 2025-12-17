import { SnowflakeParamValue, SnowflakeService } from '@data-engineering/api/services/SnowflakeService';

/**
 * Helper class for interacting with Snowflake using the SnowflakeService.
 * Delegates connection state management to SnowflakeService for consistency.
 *
 * Example usage:
 *
 *   // For multiple queries in a session (RECOMMENDED):
 *   const helper = new SnowflakeHelper();
 *   await helper.connect(); // Only connects if not already connected
 *   const rows1 = await helper.runQuery('SELECT * FROM my_table');
 *   const rows2 = await helper.runQueryWithReplacements('SELECT * FROM users WHERE tenant_code = {orgId}', { orgId: 'ABC123' });
 *   const rows3 = await helper.runQueryWithParams('SELECT * FROM users WHERE tenant_code = ?', ['ABC123']);
 *   await helper.destroy(); // Only destroys if connected
 *
 * Note: For best performance, initialize and connect once before your test(s),
 * reuse the helper for multiple queries, and destroy in teardown/afterAll.
 * Use Playwright fixtures for automatic connection lifecycle management.
 */
export class SnowflakeHelper {
  private snowflake: SnowflakeService;

  /**
   * Initializes a new SnowflakeHelper instance using environment configuration.
   */
  constructor() {
    this.snowflake = SnowflakeService.fromEnv();
  }

  /**
   * Establishes a connection to Snowflake if not already connected.
   * Delegates connection state management to SnowflakeService.
   *
   * @example
   *   const helper = new SnowflakeHelper();
   *   await helper.connect();
   */
  async connect() {
    await this.snowflake.connect();
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
    if (!this.snowflake.isConnectionActive()) {
      await this.connect();
    }
    return this.snowflake.execute<T>(sql);
  }

  /**
   * Executes a SQL query with prepared statement parameters.
   * Uses Snowflake's built-in parameter binding for better security and performance.
   *
   * @param sql - The SQL query string with ? placeholders for parameters.
   * @param params - Array of parameter values in the same order as ? placeholders.
   * @returns Promise resolving to an array of result rows.
   *
   * @example
   *   const rows = await helper.executeWithParams('SELECT * FROM users WHERE tenant_code = ?', ['ABC123']);
   */
  async executeWithParams<T = any>(sql: string, params: SnowflakeParamValue[]): Promise<T[]> {
    if (!this.snowflake.isConnectionActive()) {
      await this.connect();
    }
    return this.snowflake.executeWithParams<T>(sql, params);
  }

  /**
   * Closes the Snowflake connection if connected.
   * Delegates connection state management to SnowflakeService.
   *
   * @example
   *   await helper.destroy();
   */
  async destroy() {
    await this.snowflake.destroy();
  }

  /**
   * Checks if the Snowflake connection is currently active.
   * Delegates to SnowflakeService for connection state.
   *
   * @returns boolean - True if connection is active
   *
   * @example
   *   if (helper.isConnected()) {
   *     console.log('Connection is active');
   *   }
   */
  isConnected(): boolean {
    return this.snowflake.isConnectionActive();
  }

  /**
   * Executes a SQL query using the existing connection.
   * Assumes connection is already established.
   *
   * @param sql - The SQL query string to execute.
   * @returns Promise resolving to an array of result rows.
   *
   * @example
   *   const helper = new SnowflakeHelper();
   *   await helper.connect();
   *   const result = await helper.runQuery('SELECT * FROM my_table');
   */
  async runQuery<T = any>(sql: string): Promise<T[]> {
    return await this.execute<T>(sql);
  }

  /**
   * Executes a SQL query with parameter replacement using the existing connection.
   * Assumes connection is already established.
   *
   * @param sql - The raw SQL query string with placeholders.
   * @param replacements - Object containing key-value pairs for replacement.
   * @returns Promise resolving to query results.
   *
   * @example
   *   const helper = new SnowflakeHelper();
   *   await helper.connect();
   *   const result = await helper.runQueryWithReplacements('SELECT * FROM users WHERE tenant_code = {orgId}', { orgId: 'ABC123' });
   */
  async runQueryWithReplacements<T = any>(sql: string, replacements: Record<string, string | number>): Promise<T[]> {
    let processedSql = sql;
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{${key}}`;
      const replacement = typeof value === 'string' ? `${value}` : String(value);
      processedSql = processedSql.replace(new RegExp(placeholder, 'g'), replacement);
    }
    console.log(processedSql);
    return await this.runQuery<T>(processedSql);
  }

  /**
   * Executes a SQL query with prepared statement parameters using the existing connection.
   * Assumes connection is already established.
   * Uses Snowflake's built-in parameter binding for better security and performance.
   *
   * @param sql - The SQL query string with ? placeholders for parameters.
   * @param params - Array of parameter values in the same order as ? placeholders.
   * @returns Promise resolving to query results.
   *
   * @example
   *   const helper = new SnowflakeHelper();
   *   await helper.connect();
   *   const sql = 'SELECT * FROM users WHERE tenant_code = ? AND created_date > ?';
   *   const params = ['ABC123', '2023-01-01'];
   *   const result = await helper.runQueryWithParams(sql, params);
   */
  async runQueryWithParams<T = any>(sql: string, params: SnowflakeParamValue[]): Promise<T[]> {
    return await this.executeWithParams<T>(sql, params);
  }
}
