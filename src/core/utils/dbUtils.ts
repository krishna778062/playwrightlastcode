import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client, QueryResultRow } from 'pg';

// Load environment variables from pg.env file
dotenv.config({ path: path.resolve(process.cwd(), 'pg.env') });

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/**
 * Get database configuration from environment variables or custom config
 */
function getDatabaseConfig(customConfig?: Partial<DatabaseConfig>, database?: string): DatabaseConfig {
  // Use custom config if provided, otherwise fall back to environment variables
  const host = customConfig?.host || process.env['DB_HOST'];
  const port = customConfig?.port || parseInt(process.env['DB_PORT'] || '5432');
  const user = customConfig?.user || process.env['DB_USER'];
  const password = customConfig?.password || process.env['DB_PASSWORD'];
  const dbName = customConfig?.database || database || process.env['DB_NAME'];

  // Validate required configuration
  if (!host) {
    throw new Error(
      'Database host is not configured. Please provide host in config or set DB_HOST environment variable.'
    );
  }
  if (!user) {
    throw new Error(
      'Database user is not configured. Please provide user in config or set DB_USER environment variable.'
    );
  }
  if (!password) {
    throw new Error(
      'Database password is not configured. Please provide password in config or set DB_PASSWORD environment variable.'
    );
  }
  if (!dbName) {
    throw new Error(
      'Database name is not configured. Please provide password in config or set DB_NAME environment variable.'
    );
  }

  return {
    host,
    port,
    user,
    password,
    database: dbName,
  };
}

/**
 * Connect to DB with custom configuration or environment variables
 */
export async function connectToDB(database?: string, customConfig?: Partial<DatabaseConfig>): Promise<Client> {
  const config = getDatabaseConfig(customConfig, database);

  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  try {
    await client.connect();
    console.log(`Successfully connected to ${config.database} database`);
    return client;
  } catch (error) {
    console.error(`Failed to connect to ${config.database} database:`, error);
    throw error;
  }
}

/**
 * Execute a query with custom database configuration
 */
export async function executeQuery<T extends QueryResultRow = any>(
  query: string,
  database?: string,
  customConfig?: Partial<DatabaseConfig>
): Promise<T[]> {
  const client = await connectToDB(database, customConfig);
  try {
    console.log(`Executing query on ${database || 'default'} database:`, query);
    const result = await client.query<T>(query);
    return result.rows;
  } catch (error) {
    console.error(`Query failed on ${database || 'default'} database:`, error);
    console.error('Query was:', query);
    throw error;
  } finally {
    await closeConnection(client);
  }
}

/**
 * Write data and return the latest record
 */
export async function writeData<T extends QueryResultRow = any>(
  query: string,
  returnQuery?: string,
  database?: string,
  customConfig?: Partial<DatabaseConfig>
): Promise<T | null> {
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }

  const client = await connectToDB(database, customConfig);
  try {
    console.log(`Executing write query on ${database || 'default'} database:`, query);
    await client.query(query);

    // If returnQuery is provided, execute it to get the latest record
    if (returnQuery) {
      console.log(`Executing return query:`, returnQuery);
      const result = await client.query<T>(returnQuery);
      return result.rows[0] || null;
    }

    return null;
  } catch (error) {
    console.error(`Write query failed on ${database || 'default'} database:`, error);
    console.error('Query was:', query);
    throw error;
  } finally {
    await closeConnection(client);
  }
}

/**
 * Close the DB connection
 */
export async function closeConnection(client: Client): Promise<void> {
  try {
    await client.end();
    console.log('Database connection closed successfully');
  } catch (error) {
    console.error('Failed to close DB connection:', error);
    // Don't throw here as this is cleanup code
  }
}

/**
 * Generic Database class for any module
 */
export class Database {
  private client: Client | null = null;
  private config: DatabaseConfig;

  constructor(database?: string, customConfig?: Partial<DatabaseConfig>) {
    this.config = getDatabaseConfig(customConfig, database);
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<void> {
    this.client = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
    });

    try {
      await this.client.connect();
      console.log(`Successfully connected to ${this.config.database} database`);
    } catch (error) {
      console.error(`Failed to connect to ${this.config.database} database:`, error);
      throw error;
    }
  }

  /**
   * Execute query
   */
  async executeQuery<T extends QueryResultRow = any>(query: string): Promise<T[]> {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    try {
      console.log(`Executing query on ${this.config.database} database:`, query);
      const result = await this.client.query<T>(query);
      return result.rows;
    } catch (error) {
      console.error(`Query failed on ${this.config.database} database:`, error);
      console.error('Query was:', query);
      throw error;
    }
  }

  /**
   * Write data and return latest record
   */
  async writeData<T extends QueryResultRow = any>(query: string, returnQuery?: string): Promise<T | null> {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    try {
      console.log(`Executing write query on ${this.config.database} database:`, query);
      await this.client.query(query);

      if (returnQuery) {
        console.log(`Executing return query:`, returnQuery);
        const result = await this.client.query<T>(returnQuery);
        return result.rows[0] || null;
      }

      return null;
    } catch (error) {
      console.error(`Write query failed on ${this.config.database} database:`, error);
      console.error('Query was:', query);
      throw error;
    }
  }

  /**
   * Commit transaction
   */
  async commit(): Promise<void> {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      await this.client.query('COMMIT');
      console.log('Transaction committed successfully');
    } catch (error) {
      console.error('Failed to commit transaction:', error);
      throw error;
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.end();
        this.client = null;
        console.log('Database connection closed successfully');
      }
    } catch (error) {
      console.error('Failed to close DB connection:', error);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client !== null;
  }
}
