import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client, QueryResultRow } from 'pg';

// Load environment variables from pg.env file
dotenv.config({ path: path.resolve(process.cwd(), 'pg.env') });

/**
 * Connect to DB. Default is 'reward'. Pass 'recognition' to use the other DB.
 */
export async function connectToDB(db: 'reward' | 'recognition' = 'reward'): Promise<Client> {
  // Get environment variables with proper fallbacks
  const host = process.env['DB_HOST'];
  const port = parseInt('5432');
  const user = process.env['DB_USER'];
  const password = process.env['DB_PASSWORD'];

  // Validate required environment variables
  if (!host) {
    throw new Error('Database host is not configured. Please set PG_DB_HOST or DB_HOST environment variable.');
  }
  if (!user) {
    throw new Error('Database user is not configured. Please set PG_DB_USER or DB_USER environment variable.');
  }
  if (!password) {
    throw new Error(
      'Database password is not configured. Please set PG_DB_PASSWORD or DB_PASSWORD environment variable.'
    );
  }

  const client = new Client({
    host,
    port,
    user,
    password,
    database: db,
  });

  try {
    await client.connect();
    console.log(`Successfully connected to ${db} database`);
    return client;
  } catch (error) {
    console.error(`Failed to connect to ${db} database:`, error);
    throw error;
  }
}

/**
 * Execute a query on the selected DB (default: 'reward').
 * Returns rows as T[].
 */
export async function executeQuery<T extends QueryResultRow = any>(
  query: string,
  db: 'reward' | 'recognition' = 'reward'
): Promise<T[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }

  const client = await connectToDB(db);
  try {
    console.log(`Executing query on ${db} database:`, query);
    const result = await client.query<T>(query);
    return result.rows;
  } catch (error) {
    console.error(`Query failed on ${db} database:`, error);
    console.error('Query was:', query);
    throw error;
  } finally {
    // Always close client - no implicit COMMIT here.
    await closeConnection(client);
  }
}

/**
 * Close the DB connection.
 */
export async function closeConnection(client: Client): Promise<void> {
  try {
    if (client) {
      await client.end();
      console.log('Database connection closed successfully');
    }
  } catch (error) {
    console.error('Failed to close DB connection:', error);
    // Don't throw here as this is cleanup code
  }
}
