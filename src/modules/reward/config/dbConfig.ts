export type DatabaseType = 'reward' | 'recognition';
export type EnvironmentKey = 'dev' | 'test' | 'qa' | 'uat';

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

// Config cache - loaded once per test run (supports caching both DBs)
let dbConfigCache: {
  environment: EnvironmentKey;
  configs: Partial<Record<DatabaseType, DatabaseConfig>>;
  lastAccessedDatabase?: DatabaseType;
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

  const environment = getCurrentEnvironment();

  // Reset cache if environment changed (prevents mixing qa/test configs)
  if (!dbConfigCache || dbConfigCache.environment !== environment) {
    dbConfigCache = {
      environment,
      configs: {},
      lastAccessedDatabase: undefined,
    };
  }

  // Already initialized for this DB type in this environment
  if (dbConfigCache.configs[databaseType]) {
    dbConfigCache.lastAccessedDatabase = databaseType;
    return;
  }

  console.log(`🔧 Initializing database config for database: ${databaseType} (called from: ${caller})`);
  const databaseConfig = dbConfig[databaseType];

  if (!databaseConfig) {
    throw new Error(`❌ Database type '${databaseType}' not found`);
  }

  const envConfig = databaseConfig[environment as keyof typeof databaseConfig];
  if (!envConfig) {
    throw new Error(`❌ Environment '${environment}' not found for database type '${databaseType}'`);
  }

  dbConfigCache.configs[databaseType] = envConfig;
  dbConfigCache.lastAccessedDatabase = databaseType;

  console.log(
    `🔧 Database config initialized and cache set for environment: ${environment}, database: ${databaseType} with host: ${envConfig.host}`
  );
}

/**
 * Get database configuration for current environment (from cache)
 * Prefer using getDbConfigFromCache('reward' | 'recognition') to avoid ambiguity.
 * @returns Database configuration object
 */
export function getRewardDbConfigFromCache(dbName?: DatabaseType): DatabaseConfig {
  return getDbConfigFromCache(dbName ?? 'recognition');
}

/**
 * Get database configuration from cache (lazy-initializes if needed)
 * @param databaseType - Type of database ('reward' or 'recognition'). Defaults to 'reward' if omitted.
 */
export function getDbConfigFromCache(databaseType: DatabaseType = 'reward'): DatabaseConfig {
  if (!dbConfigCache || dbConfigCache.environment !== getCurrentEnvironment() || !dbConfigCache.configs[databaseType]) {
    initializeDbConfig(databaseType);
  }

  const cfg = dbConfigCache?.configs[databaseType];
  if (!cfg) {
    throw new Error(
      `❌ Database config not initialized for '${databaseType}'. Call initializeDbConfig('${databaseType}') first`
    );
  }

  return cfg;
}

/**
 * Get current database type from cache
 * @returns Current database type ('reward' or 'recognition')
 */
export function getCurrentDatabaseType(): DatabaseType {
  if (!dbConfigCache?.lastAccessedDatabase) {
    throw new Error(`❌ Database config not initialized! Call initializeDbConfig(databaseType) first`);
  }

  return dbConfigCache.lastAccessedDatabase;
}
