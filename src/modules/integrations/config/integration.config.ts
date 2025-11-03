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

export type TenantKey = 'primary' | 'azuresso' | 'workday' | 'okta';
export type EnvironmentKey = 'qa' | 'uat' | 'test' | 'prod';

// Singleton config cache - loaded once per test run (like Java properties)
let configCache: {
  environment: EnvironmentKey;
  currentTenant: TenantKey;
  tenantConfig: TenantConfig;
  appConfig: AppConfig;
} | null = null;

// Tenant-specific configuration structure
interface TenantConfig {
  tenantName: string;
  frontendBaseUrl: string;
  apiBaseUrl: string;
  appManagerEmail: string;
  appManagerPassword: string;
  endUserEmail: string;
  endUserPassword: string;
}

// App-level configuration (same for all tenants/environments)
interface AppConfig {
  staticFolderPath: string;
}

// Main configuration object
export const config = {
  primary: {
    qa: {
      tenantName: 'Primary Tenant',
      frontendBaseUrl: 'https://newintegrations.qa.simpplr.xyz',
      apiBaseUrl: 'https://newintegrations-api.qa.simpplr.xyz',
      appManagerEmail: 'neha.manhas@simpplr.com',
      appManagerPassword: 'Simp@12345',
      endUserEmail: 'priyanka.dubey@simpplr.com',
      endUserPassword: 'Pass@123',
    },
    uat: {
      tenantName: 'Primary Tenant',
      frontendBaseUrl: 'https://content-ui-auto1.qa.simpplr.xyz',
      apiBaseUrl: 'https://content-ui-auto1-api.qa.simpplr.xyz',
      appManagerEmail: 'kulwinder.singh@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'sonali.gupta@simpplr.com',
    },
  },
  azuresso: {
    qa: {
      tenantName: 'Azure SSO Tenant',
      frontendBaseUrl: ' https://azuresso-auto.qa.simpplr.xyz/',
      apiBaseUrl: 'https://azuresso-auto-api.qa.simpplr.xyz',
      appManagerEmail: 'kulwinder.singh@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'sonali.gupta@simpplr.com',
      endUserPassword: 'simpplr001',
    },
    uat: {
      tenantName: 'Primary Tenant',
      frontendBaseUrl: 'https://content-ui-auto1.qa.simpplr.xyz',
      apiBaseUrl: 'https://content-ui-auto1-api.qa.simpplr.xyz',
      appManagerEmail: 'kulwinder.singh@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'sonali.gupta@simpplr.com',
      endUserPassword: 'simpplr001',
    },
  },
  workday: {
    qa: {
      tenantName: 'Workday Tenant',
      frontendBaseUrl: ' https://workday.qa.simpplr.xyz/',
      apiBaseUrl: 'https://workday-auto-api.qa.simpplr.xyz',
      appManagerEmail: 'kulwinder.singh@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'sonali.gupta@simpplr.com',
      endUserPassword: 'simpplr001',
    },
  },
  okta: {
    qa: {
      tenantName: 'Okta Tenant',
      frontendBaseUrl: 'https://okta-auto.qa.simpplr.xyz',
      apiBaseUrl: 'https://okta-auto-api.qa.simpplr.xyz',
      appManagerEmail: 'kulwinder.singh@simpplr.com',
      appManagerPassword: 'simpplr001',
      endUserEmail: 'sonali.gupta@simpplr.com',
      endUserPassword: 'simpplr001',
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
  const testEnv = process.env.TEST_ENV;

  if (!testEnv) {
    throw new Error(
      `❌ TEST_ENV environment variable is required!\n` +
        `Please set TEST_ENV before running tests:\n` +
        `  TEST_ENV=qa npm run test\n` +
        `  TEST_ENV=uat npm run test\n` +
        `  TEST_ENV=prod npm run test`
    );
  }

  if (!['qa', 'uat', 'prod'].includes(testEnv)) {
    throw new Error(
      `❌ Invalid TEST_ENV value: '${testEnv}'\n` +
        `Valid values are: qa, uat, test, prod\n` +
        `Example: TEST_ENV=qa npm run test`
    );
  }

  return testEnv as EnvironmentKey;
}

/**
 * Initialize config cache for specific tenant once per test run
 * This is the equivalent of loading properties file in Java
 * Call this at the start of your test suite with the tenant you're testing
 */
export function initializeIntegrationConfig(tenant: TenantKey): void {
  if (configCache) {
    return; // Already initialized
  }

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

  console.log(`🔧 Integration module config initialized for environment: ${environment}, tenant: ${tenant}`);
  console.log(`🌐 Frontend URL: ${envConfig.frontendBaseUrl}`);
}

/**
 * Get tenant configuration for current environment (from cache)
 * No need to pass tenant - uses the initialized tenant
 * @returns Tenant configuration object
 */
export function getTenantConfig(): TenantConfig {
  if (!configCache) {
    throw new Error(`❌ Config not initialized! Call initializeIntegrationConfig(tenant) first`);
  }

  return configCache.tenantConfig;
}

/**
 * Get tenant configuration for current environment (from cache)
 * No need to pass tenant - uses the initialized tenant
 * @returns Tenant configuration object
 */
export function getTenantConfigByTenant(tenant: TenantKey): TenantConfig {
  console.log(`🔧 Getting tenant config for tenant: ${tenant}`);
  //if the cache is not initialized, initialize it
  if (!configCache) {
    initializeIntegrationConfig(tenant);
  }
  const environment = getCurrentEnvironment();
  const tenantConfig = config[tenant];
  if (!tenantConfig) {
    throw new Error(`❌ Tenant '${tenant}' not found`);
  }
  const envConfig = tenantConfig[environment as keyof typeof tenantConfig];
  if (!envConfig) {
    throw new Error(`❌ Environment '${environment}' not found for tenant '${tenant}'`);
  }
  return envConfig;
}

/**
 * Get app-level configuration (same for all tenants/environments) from cache
 * @returns App configuration object
 */
export function getAppConfig(): AppConfig {
  if (!configCache) {
    throw new Error(`❌ Config not initialized! Call initializeIntegrationConfig(tenant) first`);
  }

  return configCache.appConfig;
}

/**
 * Get combined configuration (tenant + app) for current environment
 * No need to pass tenant - uses the initialized tenant
 * @returns Combined configuration object
 */
export function getIntegrationConfig() {
  return {
    tenant: getTenantConfig(),
    app: getAppConfig(),
  };
}

/**
 * Helper function to get all available environments
 */
export function getAvailableEnvironments(): EnvironmentKey[] {
  return ['qa', 'uat', 'test', 'prod'];
}
