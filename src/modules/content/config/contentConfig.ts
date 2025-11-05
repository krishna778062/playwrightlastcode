/**
 * 1. Module autonomy - only needs content-specific variables
 * 2. Multi-tenant support - can use different tenants
 *
 * Structure: Tenant -> Environment -> Config
 * Usage: getIntegrationConfig('qa', 'primary') or getTenantConfig('qa', 'primary')
 *
 * example:
 * const config = getIntegrationConfig('primary');
 * console.log(config.tenant.tenantName);
 * console.log(config.tenant.frontendBaseUrl);
 * console.log(config.tenant.apiBaseUrl);
 * console.log(config.tenant.appManagerEmail);
 * console.log(config.tenant.appManagerPassword);
 */

export type TenantKey = 'primary' | 'contentSettings' | 'contentAbac';
export type EnvironmentKey = 'qa' | 'uat' | 'test' | 'prod';

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
  tenantConfig: ContentTenantConfig;
  appConfig: AppConfig;
} | null = null;

// Tenant-specific configuration structure
export interface ContentTenantConfig {
  tenantName: string;
  frontendBaseUrl: string;
  apiBaseUrl: string;
  appManagerEmail: string;
  appManagerPassword: string;
  endUserEmail: string;
  endUserPassword: string;
  siteManagerEmail: string;
  siteManagerPassword: string;
  newUxEnabled: boolean;
  orgId: string;
  socialCampaignManagerEmail: string;
  socialCampaignManagerPassword: string;
}

// App-level configuration (same for all tenants/environments)
export interface AppConfig {
  staticFolderPath: string;
}

// Main configuration object
export const config = {
  primary: {
    qa: {
      tenantName: 'Content Primary',
      frontendBaseUrl: 'https://content-ui-auto1.qa.simpplr.xyz',
      apiBaseUrl: 'https://content-ui-auto1-api.qa.simpplr.xyz',
      appManagerEmail: 'kulwinder.singh@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'sonali.gupta@simpplr.com',
      endUserPassword: 'simpplr001',
      siteManagerEmail: 'sonali.gupta+10@simpplr.com',
      siteManagerPassword: 'simpplr001',
      newUxEnabled: true,
      orgId: 'test-org-id',
      socialCampaignManagerEmail: 'sonali.gupta+2@simpplr.com',
      socialCampaignManagerPassword: 'simpplr001',
    },
    uat: {
      tenantName: 'Content Primary',
      frontendBaseUrl: 'https://content-ui-auto1.qa.simpplr.xyz',
      apiBaseUrl: 'https://content-ui-auto1-api.qa.simpplr.xyz',
      appManagerEmail: 'kulwinder.singh@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'sonali.gupta@simpplr.com',
      endUserPassword: 'simpplr001',
      siteManagerEmail: 'sonali.gupta+10@simpplr.com',
      siteManagerPassword: 'simpplr001',
      newUxEnabled: true,
      orgId: 'test-org-id',
      socialCampaignManagerEmail: 'sonali.gupta+2@simpplr.com',
      socialCampaignManagerPassword: 'simpplr001',
    },
  },
  contentSettings: {
    qa: {
      tenantName: 'Content Settings',
      frontendBaseUrl: ' https://automation-ui-content.qa.simpplr.xyz',
      apiBaseUrl: 'https://automation-ui-content-api.qa.simpplr.xyz',
      appManagerEmail: 'sonali.gupta@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'kulwinder.singh+1@simpplr.com',
      endUserPassword: 'simpplr001',
      siteManagerEmail: 'sonali.gupta+20@simpplr.com',
      siteManagerPassword: 'simpplr001',
      newUxEnabled: true,
      orgId: 'test-org-id',
      socialCampaignManagerEmail: 'sonali.gupta+2@simpplr.com',
      socialCampaignManagerPassword: 'simpplr001',
    },
    uat: {
      tenantName: 'Content Settings',
      frontendBaseUrl: ' https://automation-ui-content.qa.simpplr.xyz',
      apiBaseUrl: 'https://automation-ui-content-api.qa.simpplr.xyz',
      appManagerEmail: 'sonali.gupta@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'kulwinder.singh+1@simpplr.com',
      endUserPassword: 'simpplr001',
      siteManagerEmail: 'sonali.gupta+20@simpplr.com',
      siteManagerPassword: 'simpplr001',
      newUxEnabled: true,
      orgId: 'test-org-id',
      socialCampaignManagerEmail: 'sonali.gupta+2@simpplr.com',
      socialCampaignManagerPassword: 'simpplr001',
    },
  },
  contentAbac: {
    qa: {
      tenantName: 'Content ABAC',
      frontendBaseUrl: 'https://automation-test-content-alpha.qa.simpplr.xyz',
      apiBaseUrl: 'https://automation-test-content-alpha-api.qa.simpplr.xyz',
      appManagerEmail: 'diksha.gaur@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'diksha.gaur@simpplr.com',
      endUserPassword: 'simpplr001',
      siteManagerEmail: 'diksha.gaur@simpplr.com',
      siteManagerPassword: 'simpplr001',
      newUxEnabled: true,
      orgId: 'abac-qa-org-id',
      socialCampaignManagerEmail: 'diksha.gaur@simpplr.com',
      socialCampaignManagerPassword: 'simpplr001',
    },
    uat: {
      tenantName: 'Content ABAC',
      frontendBaseUrl: 'https://automation-test-content-alpha.qa.simpplr.xyz',
      apiBaseUrl: 'https://automation-test-content-alpha-api.qa.simpplr.xyz',
      appManagerEmail: 'diksha.gaur@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'diksha.gaur@simpplr.com',
      endUserPassword: 'simpplr001',
      siteManagerEmail: 'diksha.gaur@simpplr.com',
      siteManagerPassword: 'simpplr001',
      newUxEnabled: true,
      orgId: 'abac-qa-org-id',
      socialCampaignManagerEmail: 'diksha.gaur@simpplr.com',
      socialCampaignManagerPassword: 'simpplr001',
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
export function initializeContentConfig(tenant: TenantKey): void {
  const caller = getCallerInfo();

  if (configCache && configCache.currentTenant === tenant) {
    console.log(`🔧 Config already initialized for tenant: ${tenant} (called from: ${caller})`);
    return; // Already initialized for same tenant
  }

  // Allow tenant switching - clear cache if different tenant
  if (configCache && configCache.currentTenant !== tenant) {
    console.log(`🔧 Switching from tenant '${configCache.currentTenant}' to '${tenant}' (called from: ${caller})`);
  }

  console.log(`🔧 Initializing content config for tenant: ${tenant} (called from: ${caller})`);

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
    `🔧 Content module config initialized and cache set for environment: ${environment}, tenant: ${tenant} with base url: ${envConfig.frontendBaseUrl}`
  );
}

/**
 * Get tenant configuration for current environment (from cache)
 * No need to pass tenant - uses the initialized tenant
 * @returns Tenant configuration object
 */
export function getContentTenantConfigFromCache(): ContentTenantConfig {
  if (!configCache) {
    throw new Error(`❌ Config not initialized! Call initializeContentConfig(tenant) first`);
  }

  return configCache.tenantConfig;
}

/**
 * Get tenant configuration for current environment (from cache)
 * No need to pass tenant - uses the initialized tenant
 * @returns Tenant configuration object
 */
export function getContentTenantConfigFor(tenant: TenantKey): ContentTenantConfig {
  const caller = getCallerInfo();

  // If cache is initialized for the same tenant, use it
  if (configCache && configCache.currentTenant === tenant) {
    console.log(`🔧 Using cached config for tenant: ${tenant} (called from: ${caller})`);
    return configCache.tenantConfig;
  }

  // Otherwise, initialize for this tenant
  console.log(`🔧 Initializing config for tenant: ${tenant} (called from: ${caller})`);
  initializeContentConfig(tenant);
  return configCache!.tenantConfig;
}

/**
 * Get app-level configuration (same for all tenants/environments) from cache
 * @returns App configuration object
 */
export function getAppConfig(): AppConfig {
  if (!configCache) {
    throw new Error(`❌ Config not initialized! Call initializeContentConfig(tenant) first`);
  }

  return configCache.appConfig;
}

/**
 * Clear the configuration cache
 * Useful for testing or if you need to reinitialize with a different tenant
 */
export function clearContentConfigCache(): void {
  configCache = null;
  console.log('🔧 Content config cache cleared');
}

/**
 * Check if the configuration cache has been initialized
 * @returns true if cache is initialized, false otherwise
 */
export function isContentConfigInitialized(): boolean {
  return configCache !== null;
}

/**
 * Get combined configuration (tenant + app) for current environment
 * No need to pass tenant - uses the initialized tenant
 * @returns Combined configuration object
 */
export function getContentConfigFromCache() {
  return {
    tenant: getContentTenantConfigFromCache(),
    app: getAppConfig(),
  };
}
