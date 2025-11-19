/**
 * Frontline Module Configuration
 *
 * 1. Module autonomy - only needs frontline-specific variables
 * 2. Multi-tenant support - can use different tenants
 *
 * Structure: Tenant -> Environment -> Config
 * Usage: getFrontlineTenantConfigFor('primary') or getFrontlineTenantConfigFromCache()
 *
 * Example:
 * const config = getFrontlineTenantConfigFor('primary');
 * console.log(config.tenantName);
 * console.log(config.frontendBaseUrl);
 * console.log(config.apiBaseUrl);
 * console.log(config.appManagerEmail);
 * console.log(config.appManagerPassword);
 */

export type TenantKey = 'primary' | 'secondary';
export type EnvironmentKey = 'qa' | 'uat' | 'test';

export const mailosaurValues: {
  mailosaurApiKey: string;
  mailosaurServerId: string;
  mailosaurEmail: string;
  mailosaurPhone: string;
} = {
  mailosaurApiKey: '3G0mJzdusG2e4QKWsyupr2emWMQaMZi2',
  mailosaurServerId: 'bie7v7vm',
  mailosaurEmail: 'green@bie7v7vm.mailosaur.net',
  mailosaurPhone: '+12029891336',
};

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
  tenantConfig: FrontlineTenantConfig;
  appConfig: AppConfig;
} | null = null;

// Tenant-specific configuration structure
export interface FrontlineTenantConfig {
  tenantName: string;
  frontendBaseUrl: string;
  apiBaseUrl: string;
  appManagerEmail: string;
  appManagerPassword: string;
  endUserEmail: string;
  endUserPassword: string;
  promotionManagerEmail: string;
  promotionManagerPassword: string;
  newUxEnabled: boolean;
  orgId: string;
  // OTP credentials for Mailosaur
  mailosaurApiKey?: string;
  mailosaurServerId?: string;
}

// App-level configuration (same for all tenants/environments)
export interface AppConfig {
  staticFolderPath: string;
}

// Main configuration object
export const config = {
  primary: {
    qa: {
      tenantName: 'Frontline Primary QA',
      frontendBaseUrl: 'https://frontline-automation.qa.simpplr.xyz',
      apiBaseUrl: 'https://frontline-automation-api.qa.simpplr.xyz',
      appManagerEmail: 'rakesh.yadav@simpplr.com',
      appManagerPassword: 'Simp@123',
      endUserEmail: 'meenakshi.joshi+1@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '4c5dc745-2941-4871-9b08-e985f24f6f22',
    },
    test: {
      tenantName: 'Frontline Primary TEST',
      frontendBaseUrl: 'https://frontline.test.simpplr.xyz',
      apiBaseUrl: 'https://frontline-api.test.simpplr.xyz',
      appManagerEmail: 'meenakshi.joshi@simpplr.com',
      appManagerPassword: 'Simp@123',
      endUserEmail: 'yashi.gupta@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: 'd0ca1b4e-1b83-4223-8f5d-fa78fa75b01a',
    },
    uat: {
      tenantName: 'Frontline Primary UAT',
      frontendBaseUrl: 'https://frontline-automation.uat.simpplr.xyz',
      apiBaseUrl: 'https://frontline-automation-api.uat.simpplr.xyz',
      appManagerEmail: 'rakesh.yadav@simpplr.com',
      appManagerPassword: 'Simp@123',
      endUserEmail: 'meenakshi.joshi@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: 'ae412585-2c97-435e-b587-8da6971045bd',
    },
  },
  secondary: {
    qa: {
      tenantName: 'Frontline Secondary QA - OTP Tests',
      frontendBaseUrl: 'https://frontline.qa.simpplr.xyz',
      apiBaseUrl: 'https://frontline-api.qa.simpplr.xyz',
      appManagerEmail: '1473',
      appManagerPassword: 'Informa@123',
      endUserEmail: 'yashi.gupta@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: 'a925141d-2dd4-4d18-b65f-723273302065',
      // OTP credentials for Mailosaur
      mailosaurApiKey: mailosaurValues.mailosaurApiKey,
      mailosaurServerId: mailosaurValues.mailosaurServerId,
    },
    test: {
      tenantName: 'Frontline Secondary TEST',
      frontendBaseUrl: 'https://frontline-dnd.test.simpplr.xyz',
      apiBaseUrl: 'https://frontline-dnd-api.test.simpplr.xyz',
      appManagerEmail: '1473',
      appManagerPassword: 'Informa@1234',
      endUserEmail: 'yashi.gupta@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '3b170730-d660-4ec4-a600-55959d19fc29',
      // OTP credentials for Mailosaur
      mailosaurApiKey: mailosaurValues.mailosaurApiKey,
      mailosaurServerId: mailosaurValues.mailosaurServerId,
    },
    uat: {
      tenantName: 'Frontline Secondary UAT',
      frontendBaseUrl: 'https://frontline-automation-2.uat.simpplr.xyz',
      apiBaseUrl: 'https://frontline-automation-2-api.uat.simpplr.xyz',
      appManagerEmail: 'E001',
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '51ff9037-4d7f-4f57-88be-6d8e3fd8a962',
      mailosaurApiKey: mailosaurValues.mailosaurApiKey,
      mailosaurServerId: mailosaurValues.mailosaurServerId,
    },
  },
  appConfig: {
    staticFolderPath: '',
  },
};

/**
 * Get current environment from TEST_ENV (defaults to 'qa' if not set)
 */
function getCurrentEnvironment(): EnvironmentKey {
  const testEnv = process.env.TEST_ENV || 'qa';

  if (!['qa', 'uat', 'test'].includes(testEnv)) {
    throw new Error(
      `Invalid TEST_ENV value: '${testEnv}'\n` +
        `Valid values are: qa, uat, test\n` +
        `Example: TEST_ENV=qa npm run test:module frontline\n` +
        `Example: TEST_ENV=uat npm run test:module frontline\n` +
        `Example: TEST_ENV=test npm run test:module frontline\n`
    );
  }

  return testEnv as EnvironmentKey;
}

/**
 * Initialize config cache for specific tenant once per test run
 * This is the equivalent of loading properties file in Java
 * Call this at the start of your test suite with the tenant you're testing
 */
export function initializeFrontlineConfig(tenant: TenantKey): void {
  const caller = getCallerInfo();

  if (configCache && configCache.currentTenant === tenant) {
    console.log(`🔧 Frontline config already initialized for tenant: ${tenant} (called from: ${caller})`);
    return; // Already initialized for same tenant
  }

  // Allow tenant switching - clear cache if different tenant
  if (configCache && configCache.currentTenant !== tenant) {
    console.log(
      `🔧 Frontline switching from tenant '${configCache.currentTenant}' to '${tenant}' (called from: ${caller})`
    );
  }

  console.log(`🔧 Initializing frontline config for tenant: ${tenant} (called from: ${caller})`);

  const environment = getCurrentEnvironment();
  const tenantConfig = config[tenant];

  if (!tenantConfig) {
    throw new Error(`Tenant '${tenant}' not found in frontline config`);
  }

  const envConfig = tenantConfig[environment as keyof typeof tenantConfig];
  if (!envConfig) {
    throw new Error(`Environment '${environment}' not found for tenant '${tenant}' in frontline config`);
  }

  configCache = {
    environment,
    currentTenant: tenant,
    tenantConfig: envConfig,
    appConfig: config.appConfig,
  };

  console.log(
    `🔧 Frontline module config initialized and cache set for environment: ${environment}, tenant: ${tenant} with base url: ${envConfig.frontendBaseUrl}`
  );
}

/**
 * Get tenant configuration for current environment (from cache)
 * No need to pass tenant - uses the initialized tenant
 * @returns Tenant configuration object
 */
export function getFrontlineTenantConfigFromCache(): FrontlineTenantConfig {
  if (!configCache) {
    throw new Error('Frontline config not initialized! Call initializeFrontlineConfig(tenant) first');
  }

  return configCache.tenantConfig;
}

/**
 * Get tenant configuration for specific tenant
 * Initializes config if not already initialized for this tenant
 * @returns Tenant configuration object
 */
export function getFrontlineTenantConfigFor(tenant: TenantKey): FrontlineTenantConfig {
  const caller = getCallerInfo();

  // If cache is initialized for the same tenant, use it
  if (configCache && configCache.currentTenant === tenant) {
    console.log(`🔧 Using cached frontline config for tenant: ${tenant} (called from: ${caller})`);
    return configCache.tenantConfig;
  }

  // Otherwise, initialize for this tenant
  console.log(`🔧 Initializing frontline config for tenant: ${tenant} (called from: ${caller})`);
  initializeFrontlineConfig(tenant);
  return configCache!.tenantConfig;
}

/**
 * Get app-level configuration (same for all tenants/environments) from cache
 * @returns App configuration object
 */
export function getAppConfig(): AppConfig {
  if (!configCache) {
    throw new Error('Frontline config not initialized! Call initializeFrontlineConfig(tenant) first');
  }

  return configCache.appConfig;
}

/**
 * Clear the configuration cache
 * Useful for testing or if you need to reinitialize with a different tenant
 */
export function clearFrontlineConfigCache(): void {
  configCache = null;
  console.log('🔧 Frontline config cache cleared');
}

/**
 * Check if the configuration cache has been initialized
 * @returns true if cache is initialized, false otherwise
 */
export function isFrontlineConfigInitialized(): boolean {
  return configCache !== null;
}

/**
 * Get combined configuration (tenant + app) for current environment
 * No need to pass tenant - uses the initialized tenant
 * @returns Combined configuration object
 */
export function getFrontlineConfigFromCache() {
  return {
    tenant: getFrontlineTenantConfigFromCache(),
    app: getAppConfig(),
  };
}

/**
 * Get current environment name
 * @returns Current environment key
 */
export function getCurrentEnvironmentKey(): EnvironmentKey {
  if (!configCache) {
    throw new Error('Frontline config not initialized! Call initializeFrontlineConfig(tenant) first');
  }
  return configCache.environment;
}

/**
 * Get current tenant name
 * @returns Current tenant key
 */
export function getCurrentTenantKey(): TenantKey {
  if (!configCache) {
    throw new Error('Frontline config not initialized! Call initializeFrontlineConfig(tenant) first');
  }
  return configCache.currentTenant;
}
