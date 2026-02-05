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
export type EnvironmentKey =
  | 'qa'
  | 'uat'
  | 'test'
  | 'uatEU'
  | 'prodUS'
  | 'prodAU'
  | 'prodCA'
  | 'prodEU'
  | 'uatAU'
  | 'uatCA';

export const mailosaurValues: {
  mailosaurApiKey: string;
  mailosaurServerId: string;
  mailosaurEmail: string;
  mailosaurPhone: string;
} = {
  mailosaurApiKey: '3G0mJzdusG2e4QKWsyupr2emWMQaMZi2',
  mailosaurServerId: 'bie7v7vm',
  mailosaurEmail: 'green+1@bie7v7vm.mailosaur.net',
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
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi+1@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '4c5dc745-2941-4871-9b08-e985f24f6f22',
    },
    test: {
      tenantName: 'Frontline Primary TEST',
      frontendBaseUrl: 'https://chat1.test.simpplr.xyz',
      apiBaseUrl: 'https://chat1-api.test.simpplr.xyz',
      appManagerEmail: 'shivam.kalkhanday@radiansys.com',
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi+2@simpplr.com',
      endUserPassword: 'Test@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Test@123',
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
    uatEU: {
      tenantName: 'Frontline Primary UAT EU',
      frontendBaseUrl: 'https://chatmod.uat-eu.simpplr.xyz',
      apiBaseUrl: 'https://chatmod-api.uat-eu.simpplr.xyz',
      appManagerEmail: 'arvind.singh@simpplr.com',
      appManagerPassword: '_Simp_1234',
      endUserEmail: 'meenakshi.joshi+2@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '38f7c5e8-0e37-4e72-b170-064564d01e9d',
    },
    uatAU: {
      tenantName: 'Frontline Primary UAT AU',
      frontendBaseUrl: 'https://messaging.uat-au.simpplr.com',
      apiBaseUrl: 'https://messaging-api.uat-au.simpplr.com',
      appManagerEmail: 'rakesh.yadav@simpplr.com',
      appManagerPassword: 'Test@123',
      endUserEmail: 'arvind.singh@simpplr.com',
      endUserPassword: '_Simp_1234',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '6818dda4-b91e-4180-9ecb-d192c062af5a',
    },
    uatCA: {
      tenantName: 'Frontline Primary UAT CA',
      frontendBaseUrl: 'https://messaging.uat-ca.simpplr.com',
      apiBaseUrl: 'https://messaging-api.uat-ca.simpplr.com',
      appManagerEmail: 'rakesh.yadav@simpplr.com',
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi+2@simpplr.com',
      endUserPassword: 'Test@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '6fcd4de3-1cea-4bc4-92dd-49d05295669f',
    },
    prodUS: {
      tenantName: 'Frontline Primary PROD US',
      frontendBaseUrl: 'https://ping-automation.app.simpplr.com',
      apiBaseUrl: 'https://ping-automation-api.app.simpplr.com',
      appManagerEmail: 'arvind.singh@simpplr.com',
      appManagerPassword: '_Simp_1234',
      endUserEmail: 'meenakshi.joshi+1@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '020cb3c0-14b6-4a6e-9bae-ade3b0e30f79',
    },
    prodAU: {
      tenantName: 'Frontline Primary PROD AU',
      frontendBaseUrl: 'https://messaging.au.simpplr.com',
      apiBaseUrl: 'https://messaging-api.au.simpplr.com',
      appManagerEmail: 'rakesh.yadav@simpplr.com',
      appManagerPassword: 'Test@123',
      endUserEmail: 'arvind.singh@simpplr.com',
      endUserPassword: '_Simp_1234',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Test@123',
      newUxEnabled: false,
      orgId: '60a6a9b1-95fa-4950-a187-49d6bf294f66',
    },
    prodCA: {
      tenantName: 'Frontline Primary PROD CA',
      frontendBaseUrl: 'https://messaging.ca.simpplr.com',
      apiBaseUrl: 'https://messaging-api.ca.simpplr.com',
      appManagerEmail: 'rakesh.yadav@simpplr.com',
      appManagerPassword: 'Test@123',
      endUserEmail: 'arvind.singh@simpplr.com',
      endUserPassword: '_Simp_1234',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Test@123',
      newUxEnabled: false,
      orgId: 'f859cfd2-0039-46d5-bc4c-9c389dd97564',
    },
    prodEU: {
      tenantName: 'Frontline Primary PROD EU',
      frontendBaseUrl: 'https://messaging.eu.simpplr.com',
      apiBaseUrl: 'https://messaging-api.eu.simpplr.com',
      appManagerEmail: 'rakesh.yadav@simpplr.com',
      appManagerPassword: 'Test@123',
      endUserEmail: 'arvind.singh@simpplr.com',
      endUserPassword: '_Simp_1234',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Test@123',
      newUxEnabled: false,
      orgId: '86eedaf3-0feb-445b-9001-6be71d42c33a',
    },
  },
  secondary: {
    qa: {
      tenantName: 'Frontline Secondary QA - OTP Tests',
      frontendBaseUrl: 'https://frontline.qa.simpplr.xyz',
      apiBaseUrl: 'https://frontline-api.qa.simpplr.xyz',
      appManagerEmail: '1473',
      appManagerPassword: 'Simpplr@21',
      endUserEmail: 'E001',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'R005',
      promotionManagerPassword: 'Simpplr@21',
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
    uatEU: {
      tenantName: 'Frontline Secondary UAT',
      frontendBaseUrl: 'https://frontline.uat-eu.simpplr.xyz/',
      apiBaseUrl: 'https://frontline-api.uat-eu.simpplr.xyz',
      appManagerEmail: '1473',
      appManagerPassword: 'Simp@123',
      endUserEmail: 'meenakshi.joshi@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: 'ab6fa2d0-5015-49f3-bc88-6ddce62d7281',
      mailosaurApiKey: mailosaurValues.mailosaurApiKey,
      mailosaurServerId: mailosaurValues.mailosaurServerId,
    },
    uatAU: {
      tenantName: 'Frontline Secondary UAT AU',
      frontendBaseUrl: 'https://frontline.uat-au.simpplr.com',
      apiBaseUrl: 'https://frontline-api.uat-au.simpplr.com',
      appManagerEmail: '1473',
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi+2@simpplr.com',
      endUserPassword: 'Test@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: 'd59535e2-fb3e-4deb-87ad-b8ad3733ed2b',
      mailosaurApiKey: mailosaurValues.mailosaurApiKey,
      mailosaurServerId: mailosaurValues.mailosaurServerId,
    },
    uatCA: {
      tenantName: 'Frontline Secondary UAT CA',
      frontendBaseUrl: 'https://frontline.uat-ca.simpplr.com',
      apiBaseUrl: 'https://frontline-api.uat-ca.simpplr.com',
      appManagerEmail: '1473',
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi+2@simpplr.com',
      endUserPassword: 'Test@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '166d8aef-ae9f-46dc-9a2b-eae55e09cde2',
      mailosaurApiKey: mailosaurValues.mailosaurApiKey,
      mailosaurServerId: mailosaurValues.mailosaurServerId,
    },
    prodUS: {
      tenantName: 'Frontline Secondary PROD US',
      frontendBaseUrl: 'https://frontline-automation.app.simpplr.com',
      apiBaseUrl: 'https://frontline-automation-api.app.simpplr.com',
      appManagerEmail: '1473',
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi@simpplr.com',
      endUserPassword: 'Simp@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: 'd181647a-958c-4108-b2d2-913b60687da6',
      mailosaurApiKey: mailosaurValues.mailosaurApiKey,
      mailosaurServerId: mailosaurValues.mailosaurServerId,
    },
    prodAU: {
      tenantName: 'Frontline Secondary PROD AU',
      frontendBaseUrl: 'https://frontline.au.simpplr.com',
      apiBaseUrl: 'https://frontline-api.au.simpplr.com',
      appManagerEmail: '1473',
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi+2@simpplr.com',
      endUserPassword: 'Test@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '60a6a9b1-95fa-4950-a187-49d6bf294f66',
      mailosaurApiKey: mailosaurValues.mailosaurApiKey,
      mailosaurServerId: mailosaurValues.mailosaurServerId,
    },
    prodCA: {
      tenantName: 'Frontline Secondary PROD CA',
      frontendBaseUrl: 'https://frontline.ca.simpplr.com',
      apiBaseUrl: 'https://frontline-api.ca.simpplr.com',
      appManagerEmail: '1473',
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi+2@simpplr.com',
      endUserPassword: 'Test@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '6fcd4de3-1cea-4bc4-92dd-49d05295669f',
      mailosaurApiKey: mailosaurValues.mailosaurApiKey,
      mailosaurServerId: mailosaurValues.mailosaurServerId,
    },
    prodEU: {
      tenantName: 'Frontline Secondary PROD EU',
      frontendBaseUrl: 'https://frontline.eu.simpplr.com',
      apiBaseUrl: 'https://frontline-api.eu.simpplr.com',
      appManagerEmail: '1473',
      appManagerPassword: 'Test@123',
      endUserEmail: 'meenakshi.joshi+2@simpplr.com',
      endUserPassword: 'Test@123',
      promotionManagerEmail: 'meenakshi.joshi+1@simpplr.com',
      promotionManagerPassword: 'Simp@123',
      newUxEnabled: false,
      orgId: '86eedaf3-0feb-445b-9001-6be71d42c33a',
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

  if (!['qa', 'uat', 'test', 'uatEU', 'uatAU', 'uatCA', 'prodUS', 'prodAU', 'prodCA', 'prodEU'].includes(testEnv)) {
    throw new Error(
      `Invalid TEST_ENV value: '${testEnv}'\n` +
        `Valid values are: qa, uat, test, uatEU, uatAU, uatCA, prodUS, prodAU, prodCA, prodEU\n` +
        `Example: TEST_ENV=qa npm run test:module frontline\n` +
        `Example: TEST_ENV=uat npm run test:module frontline\n` +
        `Example: TEST_ENV=test npm run test:module frontline\n` +
        `Example: TEST_ENV=uatEU npm run test:module frontline\n` +
        `Example: TEST_ENV=uatAU npm run test:module frontline\n` +
        `Example: TEST_ENV=uatCA npm run test:module frontline\n` +
        `Example: TEST_ENV=prodUS npm run test:module frontline\n` +
        `Example: TEST_ENV=prodAU npm run test:module frontline\n` +
        `Example: TEST_ENV=prodCA npm run test:module frontline\n` +
        `Example: TEST_ENV=prodEU npm run test:module frontline\n`
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

  if (configCache?.currentTenant === tenant) {
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
  if (configCache?.currentTenant === tenant) {
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
