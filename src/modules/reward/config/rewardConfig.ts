export type TenantKey = 'primary' | 'rewardSettings';
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
let configCache: {
  environment: EnvironmentKey;
  currentTenant: TenantKey;
  tenantConfig: RewardTenantConfig;
  appConfig: AppConfig;
} | null = null;

// Tenant-specific configuration structure
export interface RewardTenantConfig {
  tenantName: string;
  frontendBaseUrl: string;
  apiBaseUrl: string;
  appManagerEmail: string;
  appManagerName: string;
  appManagerUserId: string;
  appManagerPassword: string;
  recognitionManagerEmail: string;
  recognitionManagerName: string;
  recognitionManagerUserId: string;
  recognitionManagerPassword: string;
  endUserEmail: string;
  endUserName: string;
  endUserUserId: string;
  endUserPassword: string;
  newUxEnabled: boolean;
}

// App-level configuration (same for all tenants/environments)
export interface AppConfig {
  staticFolderPath: string;
}

// Main configuration object
export const config = {
  primary: {
    qa: {
      tenantName: 'Reward QA Primary',
      frontendBaseUrl: 'https://reward.qa.simpplr.xyz',
      apiBaseUrl: 'https://reward-api.qa.simpplr.xyz',
      appManagerEmail: 'sonu.kumar+1@simpplr.com',
      appManagerName: 'App Manager',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'Simpplr123',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'sonu.kumar+3@simpplr.com',
      endUserName: 'Standard User',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'Simpplr123',
      newUxEnabled: true,
    },
    test: {
      tenantName: 'Reward Test Primary',
      frontendBaseUrl: 'https://rewards.test.simpplr.xyz/',
      apiBaseUrl: 'https://rewards-api.test.simpplr.xyz',
      appManagerEmail: 'sonu.kumar+1@simpplr.com',
      appManagerName: 'App Manager',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'Simpplr123',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: '8e2c223a-4e1b-4fb9-a7bc-f706f226f6f2',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'sonu.kumar+3@simpplr.com',
      endUserName: 'Standard User',
      endUserUserId: '9e2ac2e5-7ccd-4037-b7c4-c176b4eba380',
      endUserPassword: 'Simpplr123',
      newUxEnabled: true,
    },
    uat: {
      tenantName: 'Reward UAT Primary',
      frontendBaseUrl: 'https://rewards.uat.simpplr.xyz',
      apiBaseUrl: 'https://rewards-api.uat.simpplr.xyz',
      appManagerEmail: 'sonu.kumar+1@simpplr.com',
      appManagerName: 'App Manager',
      appManagerUserId: '5bd95d69-7a3d-446c-abc7-a50314a97884',
      appManagerPassword: 'Simpplr123',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: '10af260e-3449-4309-be5d-98de62efdcf7',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'sonu.kumar+3@simpplr.com',
      endUserName: 'Standard User',
      endUserUserId: 'b6e789e5-4024-43ee-b976-2dcdb217c7a1',
      endUserPassword: 'Simpplr123',
      newUxEnabled: true,
    },
  },
  rewardSettings: {
    qa: {
      tenantName: 'Reward Settings QA',
      frontendBaseUrl: 'https://reward-settings.qa.simpplr.xyz',
      apiBaseUrl: 'https://reward-settings-api.qa.simpplr.xyz',
      appManagerEmail: 'sonu.kumar+1@simpplr.com',
      appManagerName: 'App Manager',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'Simpplr123',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'sonu.kumar+3@simpplr.com',
      endUserName: 'Standard User',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'Simpplr123',
      newUxEnabled: true,
    },
    test: {
      tenantName: 'Reward Settings Test',
      frontendBaseUrl: 'https://reward-setting.test.simpplr.xyz',
      apiBaseUrl: 'https://reward-setting-api.test.simpplr.xyz',
      appManagerEmail: 'sonu.kumar+1@simpplr.com',
      appManagerName: 'App Manager',
      appManagerUserId: 'bdfcdf8d-e148-4b93-87d2-838b336806e2',
      appManagerPassword: 'Simpplr123',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: '1c0cc926-1b63-4932-ba00-7c3a262ea229',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'sonu.kumar+3@simpplr.com',
      endUserName: 'Standard User',
      endUserUserId: '155fcda1-88e6-4296-8737-897a9e173a49',
      endUserPassword: 'Simpplr123',
      newUxEnabled: true,
    },
    uat: {
      tenantName: 'Reward Primary UAT',
      frontendBaseUrl: 'https://reward-settings.uat.simpplr.xyz',
      apiBaseUrl: 'https://reward-settings-api.uat.simpplr.xyz',
      appManagerEmail: 'sonu.kumar+1@simpplr.com',
      appManagerName: 'App Manager',
      appManagerUserId: 'bdfcdf8d-e148-4b93-87d2-838b336806e2',
      appManagerPassword: 'Simpplr123',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: '1c0cc926-1b63-4932-ba00-7c3a262ea229',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'sonu.kumar+3@simpplr.com',
      endUserName: 'Standard User',
      endUserUserId: '155fcda1-88e6-4296-8737-897a9e173a49',
      endUserPassword: 'Simpplr123',
      newUxEnabled: true,
    },
  },
  appConfig: {
    staticFolderPath: '',
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
        `  TEST_ENV=uat npm run test\n` +
        `  TEST_ENV=prod npm run test`
    );
  }

  if (!['qa', 'uat', 'prod', 'test'].includes(testEnv)) {
    throw new Error(
      `❌ Invalid TEST_ENV value: '${testEnv}'\n` +
        `Valid values are: qa, uat, test, prod\n` +
        `Example: TEST_ENV=qa npm run test\n` +
        `Example: TEST_ENV=uat npm run test\n` +
        `Example: TEST_ENV=prod npm run test\n` +
        `Example: TEST_ENV=test npm run test\n`
    );
  }

  return testEnv as EnvironmentKey;
}

/**
 * Initialize config cache for specific tenant once per test run
 * This is the equivalent of loading properties file in Java
 * Call this at the start of your test suite with the tenant you're testing
 */
export function initializeRewardConfig(tenant: TenantKey): void {
  const caller = getCallerInfo();

  if (configCache && configCache.currentTenant === tenant) {
    console.log(`🔧 Config already initialized for tenant: ${tenant} (called from: ${caller})`);
    return; // Already initialized for the same tenant
  }

  // Allow tenant switching - clear cache if different tenant
  if (configCache && configCache.currentTenant !== tenant) {
    console.log(`🔧 Switching from tenant '${configCache.currentTenant}' to '${tenant}' (called from: ${caller})`);
  }

  console.log(`🔧 Initializing reward config for tenant: ${tenant} (called from: ${caller})`);

  const environment = getCurrentEnvironment();
  const tenantConfig = config[tenant];

  if (!tenantConfig) {
    throw new Error(`❌ Tenant '${tenant}' not found`);
  }

  const envConfig = tenantConfig[environment as keyof typeof tenantConfig];
  if (!envConfig) {
    throw new Error(`❌ Environment '${environment}' not found for tenant '${tenant}'`);
  }

  configCache = {
    environment,
    currentTenant: tenant,
    tenantConfig: envConfig,
    appConfig: config.appConfig,
  };

  console.log(
    `🔧 Reward module config initialized and cache set for environment: ${environment}, tenant: ${tenant} with base url: ${envConfig.frontendBaseUrl}`
  );
}

/**
 * Get tenant configuration for current environment (from cache)
 * No need to pass tenant - uses the initialized tenant
 * @returns Tenant configuration object
 */
export function getRewardTenantConfigFromCache(): RewardTenantConfig {
  if (!configCache) {
    throw new Error(`❌ Config not initialized! Call initializeRewardConfig(tenant) first`);
  }

  return configCache.tenantConfig;
}
