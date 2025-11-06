export type DatabaseType = 'reward' | 'recognition';
export type EnvironmentKey = 'qa' | 'test';

/**
 * Get caller function information for debugging
 */
function getCallerInfo(): string {
  const stack = new Error().stack;
  if (!stack) return 'unknown';

  const lines = stack.split('\n');
  // Skip the first 3 lines: Error, getCallerInfo, and the function calling getCallerInfo
  const callerLine = lines[3];
  if (!callerLine) return 'unknown';

  // Extract file name and line number
  const match = callerLine.match(/\((.+):(\d+):(\d+)\)/);
  if (match) {
    const [, filePath, line, col] = match;
    const fileName = filePath.split('/').pop() || filePath;
    return `${fileName}:${line}:${col}`;
  }

  return 'unknown';
}

// Singleton config cache - loaded once per test run
let dbConfigCache: {
  environment: EnvironmentKey;
  currentDatabase: DatabaseType;
  dbConfig: DatabaseConfig;
} | null = null;

// Database configuration structure
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Main database configuration object
export const dbConfig = {
  reward: {
    qa: {
      host: 'db.qa.simpplr.xyz',
      port: 5432,
      user: 'root_reward',
      password: '87d8efe1-acbd-4721-92d1-869d996b89d6',
      database: 'reward',
    },
    test: {
      host: 'db.test.simpplr.xyz',
      port: 5432,
      user: 'outbox_event_router',
      password: '9d87ef93-2553-4e73-bbcc-7a11f735dd40',
      database: 'reward',
    },
  },
  recognition: {
    qa: {
      host: 'db.qa.simpplr.xyz',
      port: 5432,
      user: 'root_recognition',
      password: 'aefa583f-0391-4147-9cb9-587d3b3253a5',
      database: 'recognition',
    },
    test: {
      host: 'db.test.simpplr.xyz',
      port: 5432,
      user: 'outbox_event_router',
      password: '9d87ef93-2553-4e73-bbcc-7a11f735dd40',
      database: 'recognition',
    },
  },
};

/**
 * Get current environment from TEST_ENV (required)
 * Throws error if TEST_ENV is not set or invalid
 */
function getCurrentEnvironment(): EnvironmentKey {
  const testEnv = process.env.TEST_ENV || 'qa';

  if (!testEnv) {
    throw new Error(
      `❌ TEST_ENV environment variable is required!\n` +
        `Please set TEST_ENV before running tests:\n` +
        `  TEST_ENV=qa npm run test\n` +
        `  TEST_ENV=test npm run test`
    );
  }

  if (!['qa', 'test'].includes(testEnv)) {
    throw new Error(
      `❌ Invalid TEST_ENV value: '${testEnv}'\n` +
        `Valid values are: qa, test\n` +
        `Example: TEST_ENV=qa npm run test\n` +
        `Example: TEST_ENV=test npm run test\n`
    );
  }

  return testEnv as EnvironmentKey;
}

/**
 * Initialize database config cache for specific database type once per test run
 * This is the equivalent of loading properties file in Java
 * Call this at the start of your test suite with the database type you're testing
 */
export function initializeDbConfig(databaseType: DatabaseType): void {
  const caller = getCallerInfo();

  if (dbConfigCache && dbConfigCache.currentDatabase === databaseType) {
    console.log(`🔧 DB Config already initialized for database: ${databaseType} (called from: ${caller})`);
    return; // Already initialized for the same database
  }

  // Allow database switching - clear cache if different database
  if (dbConfigCache && dbConfigCache.currentDatabase !== databaseType) {
    console.log(
      `🔧 Switching from database '${dbConfigCache.currentDatabase}' to '${databaseType}' (called from: ${caller})`
    );
  }

  console.log(`🔧 Initializing database config for database: ${databaseType} (called from: ${caller})`);

  const environment = getCurrentEnvironment();
  const databaseConfig = dbConfig[databaseType];

  if (!databaseConfig) {
    throw new Error(`❌ Database type '${databaseType}' not found`);
  }

  const envConfig = databaseConfig[environment as keyof typeof databaseConfig];
  if (!envConfig) {
    throw new Error(`❌ Environment '${environment}' not found for database type '${databaseType}'`);
  }

  dbConfigCache = {
    environment,
    currentDatabase: databaseType,
    dbConfig: envConfig,
  };

  console.log(
    `🔧 Database config initialized and cache set for environment: ${environment}, database: ${databaseType} with host: ${envConfig.host}`
  );
}

/**
 * Get database configuration for current environment (from cache)
 * No need to pass database type - uses the initialized database
 * @returns Database configuration object
 */
export function getDbConfigFromCache(): DatabaseConfig {
  if (!dbConfigCache) {
    throw new Error(`❌ Database config not initialized! Call initializeDbConfig(databaseType) first`);
  }

  return dbConfigCache.dbConfig;
}

/**
 * Get database host from cache
 * @returns Database host string
 */
export function getDbHost(): string {
  return getDbConfigFromCache().host;
}

/**
 * Get database port from cache
 * @returns Database port number
 */
export function getDbPort(): number {
  return getDbConfigFromCache().port;
}

/**
 * Get database user from cache
 * @returns Database user string
 */
export function getDbUser(): string {
  return getDbConfigFromCache().user;
}

/**
 * Get database password from cache
 * @returns Database password string
 */
export function getDbPassword(): string {
  return getDbConfigFromCache().password;
}

/**
 * Get database name from cache
 * @returns Database name string
 */
export function getDbName(): string {
  return getDbConfigFromCache().database;
}

/**
 * Get current database type from cache
 * @returns Current database type ('reward' or 'recognition')
 */
export function getCurrentDatabaseType(): DatabaseType {
  if (!dbConfigCache) {
    throw new Error(`❌ Database config not initialized! Call initializeDbConfig(databaseType) first`);
  }

  return dbConfigCache.currentDatabase;
}
