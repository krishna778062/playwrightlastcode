export type TenantKey = 'primary' | 'onlyPeerToPeer';
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
  tenantConfig: RecognitionTenantConfig;
  appConfig: AppConfig;
} | null = null;

// Tenant-specific configuration structure
export interface RecognitionTenantConfig {
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
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://reco-auto.qa.simpplr.xyz/',
      apiBaseUrl: 'https://reco-auto-api.qa.simpplr.xyz/',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'simpplr123',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'arbind.kumar@simpplr.com',
      endUserName: 'arbind appmanager',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'simpplr123',
      newUxEnabled: true,
    },
    test: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://reco-automation.test.simpplr.xyz/',
      apiBaseUrl: 'https://reco-automation-api.test.simpplr.xyz/',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'simpplr123',
      recognitionManagerEmail: 'aishma.gupta+5@simpplr.com',
      recognitionManagerName: 'Recognition User',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+1@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'simpplr123',
      newUxEnabled: true,
    },
  },
  onlyPeerToPeer: {
    test: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://p2ptestenv.test.simpplr.xyz',
      apiBaseUrl: 'https://p2ptestenv-api.test.simpplr.xyz',
      appManagerEmail: 'charan.b@simpplr.com',
      appManagerName: 'Sonu Kumar',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'Simpplr@1234',
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
export function initializeRecognitionConfig(tenant: TenantKey): void {
  const caller = getCallerInfo();

  if (configCache && configCache.currentTenant === tenant) {
    console.log(`🔧 Config already initialized for tenant: ${tenant} (called from: ${caller})`);
    return; // Already initialized for the same tenant
  }

  // Allow tenant switching - clear cache if different tenant
  if (configCache && configCache.currentTenant !== tenant) {
    console.log(`🔧 Switching from tenant '${configCache.currentTenant}' to '${tenant}' (called from: ${caller})`);
  }

  console.log(`🔧 Initializing recognition config for tenant: ${tenant} (called from: ${caller})`);

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
    `🔧 Recognition module config initialized and cache set for environment: ${environment}, tenant: ${tenant} with base url: ${envConfig.frontendBaseUrl}`
  );
}

/**
 * Get tenant configuration for current environment (from cache)
 * No need to pass tenant - uses the initialized tenant
 * @returns Tenant configuration object
 */
export function getRecognitionTenantConfigFromCache(): RecognitionTenantConfig {
  if (!configCache) {
    throw new Error(`❌ Config not initialized! Call initializeRecognitionConfig(tenant) first`);
  }

  return configCache.tenantConfig;
}
