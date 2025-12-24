/**
 * Data Engineering Module Configuration
 *
 * Structure: Tenant -> Environment -> Config
 * Usage: initializeDataEngineeringConfig('primary') or initializeDataEngineeringConfig('abac')
 * - Single TEST_ENV variable to select environment
 * - Tenant type determines which config to use
 */

import { log } from '@core/utils/logger';

export type TenantKey = 'primary' | 'abac';
export type EnvironmentKey = 'qa' | 'test' | 'uat' | 'uatEU' | 'prodUS';

// Tenant-specific configuration structure
export interface DataEngineeringTenantConfig {
  tenantName: string;
  frontendBaseUrl: string;
  apiBaseUrl: string;
  apiBeUrl?: string;
  appManagerEmail: string;
  appManagerPassword: string;
  standardUserEmail: string;
  standardUserPassword: string;
  orgId: string;
  odinOrgId?: string;
}

// Singleton config cache
let configCache: {
  environment: EnvironmentKey;
  currentTenant: TenantKey;
  tenantConfig: DataEngineeringTenantConfig;
} | null = null;

// Main configuration object
export const config: Record<TenantKey, Partial<Record<EnvironmentKey, DataEngineeringTenantConfig>>> = {
  primary: {
    test: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://de.test.simpplr.xyz',
      apiBaseUrl: 'https://de-api.test.simpplr.xyz',
      apiBeUrl: 'https://api-be.test.simpplr.xyz',
      appManagerEmail: 'divya.jain@simpplr.com',
      appManagerPassword: 'test@12345',
      standardUserEmail: 'adil.shamim+2@simpplr.com',
      standardUserPassword: 'test@123456',
      orgId: 'ea411953-6702-4a01-8b03-b98a172be511',
      odinOrgId: '00D8Y000000g1g2UAA',
    },
    qa: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://de-auto.qa.simpplr.xyz',
      apiBaseUrl: 'https://de-auto-api.qa.simpplr.xyz',
      apiBeUrl: 'https://api-be.qa.simpplr.xyz',
      appManagerEmail: 'bharat.madaan@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'simpplr.dev+amber.rich@example.com',
      standardUserPassword: 'Simpplr@123',
      orgId: 'd3b0479f-3651-4066-b8fa-960f991313a6',
      odinOrgId: '00D5j00000CN5otEAD',
    },
    uat: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://de-auto.uat.simpplr.xyz',
      apiBaseUrl: 'https://de-auto-api.uat.simpplr.xyz',
      apiBeUrl: 'https://api-be.uat.simpplr.xyz',
      appManagerEmail: 'bharat.madaan@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'simpplr.dev+amber.rich@example.com',
      standardUserPassword: 'Simpplr@123',
      orgId: '51c136f3-b99e-450c-81c8-743521eafe68',
      odinOrgId: 'uat-odin-org-id',
    },
    uatEU: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://de.uat-eu.simpplr.xyz',
      apiBaseUrl: 'https://de-api.uat-eu.simpplr.xyz',
      apiBeUrl: 'https://api-be.uat-eu.simpplr.xyz',
      appManagerEmail: 'divyansh.kumar@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'adil.shamim+2@simpplr.com',
      standardUserPassword: 'Simpplr@2025',
      orgId: 'uat-eu-primary-org-id',
      odinOrgId: 'uat-eu-odin-org-id',
    },
    prodUS: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://de.app.simpplr.com',
      apiBaseUrl: 'https://de-api.app.simpplr.com',
      apiBeUrl: 'https://api-be.app.simpplr.com',
      appManagerEmail: 'divyansh.kumar@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'adil.shamim+2@simpplr.com',
      standardUserPassword: 'Simpplr@2025',
      orgId: 'prod-primary-org-id',
      odinOrgId: 'prod-odin-org-id',
    },
  },
  abac: {
    test: {
      tenantName: 'Data Engineering ABAC',
      frontendBaseUrl: 'https://de-abac.test.simpplr.xyz',
      apiBaseUrl: 'https://de-abac-api.test.simpplr.xyz',
      appManagerEmail: 'divyansh.kumar@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'adil.shamim+2@simpplr.com',
      standardUserPassword: 'Simpplr@2025',
      orgId: 'a84d427b-70d1-4cbe-872b-569802f50550',
    },
    qa: {
      tenantName: 'Data Engineering ABAC',
      frontendBaseUrl: 'https://abac.qa.simpplr.xyz',
      apiBaseUrl: 'https://abac-api.qa.simpplr.xyz',
      appManagerEmail: 'aman.mishra@simpplr.com',
      appManagerPassword: 'Simp@1234',
      standardUserEmail: 'adil.shamim+2@simpplr.com',
      standardUserPassword: 'Simpplr@2025',
      orgId: '2db06f07-ef09-41c0-90a6-d41cff3f1604',
    },
    uat: {
      tenantName: 'Data Engineering ABAC',
      frontendBaseUrl: 'https://abac.uat.simpplr.xyz',
      apiBaseUrl: 'https://abac-api.uat.simpplr.xyz',
      appManagerEmail: 'aman.mishra@simpplr.com',
      appManagerPassword: 'Simp@1234',
      standardUserEmail: 'adil.shamim+2@simpplr.com',
      standardUserPassword: 'Simpplr@2025',
      orgId: 'uat-abac-org-id',
    },
    uatEU: {
      tenantName: 'Data Engineering ABAC',
      frontendBaseUrl: 'https://abac.uat-eu.simpplr.xyz',
      apiBaseUrl: 'https://abac-api.uat-eu.simpplr.xyz',
      appManagerEmail: 'aman.mishra@simpplr.com',
      appManagerPassword: 'Simp@1234',
      standardUserEmail: 'adil.shamim+2@simpplr.com',
      standardUserPassword: 'Simpplr@2025',
      orgId: 'uat-eu-abac-org-id',
    },
    prodUS: {
      tenantName: 'Data Engineering ABAC',
      frontendBaseUrl: 'https://abac.app.simpplr.com',
      apiBaseUrl: 'https://abac-api.app.simpplr.com',
      appManagerEmail: 'aman.mishra@simpplr.com',
      appManagerPassword: 'Simp@1234',
      standardUserEmail: 'adil.shamim+2@simpplr.com',
      standardUserPassword: 'Simpplr@2025',
      orgId: 'prod-abac-org-id',
    },
  },
};

/**
 * Get current environment from TEST_ENV
 */
function getCurrentEnvironment(): EnvironmentKey {
  const testEnv = process.env.TEST_ENV || 'qa';

  const validEnvs: EnvironmentKey[] = ['qa', 'test', 'uat', 'uatEU', 'prodUS'];
  if (!validEnvs.includes(testEnv as EnvironmentKey)) {
    throw new Error(
      `Invalid TEST_ENV value: '${testEnv}'\n` +
        `Valid values are: ${validEnvs.join(', ')}\n` +
        `Example: TEST_ENV=qa npm run test:de-api`
    );
  }

  return testEnv as EnvironmentKey;
}

/**
 * Initialize config cache for specific tenant
 * Call this at the start of your test suite
 */
export function initializeDataEngineeringConfig(tenant: TenantKey): void {
  if (configCache && configCache.currentTenant === tenant) {
    return; // Already initialized for same tenant
  }

  const environment = getCurrentEnvironment();
  const tenantConfig = config[tenant]?.[environment];

  if (!tenantConfig) {
    throw new Error(`Configuration not found for tenant '${tenant}' in environment '${environment}'`);
  }

  configCache = {
    environment,
    currentTenant: tenant,
    tenantConfig,
  };

  log.debug(`Data Engineering config initialized: tenant=${tenant}, env=${environment}`);
}

/**
 * Get tenant configuration from cache
 */
export function getDataEngineeringConfigFromCache(): DataEngineeringTenantConfig {
  if (!configCache) {
    throw new Error(`Config not initialized! Call initializeDataEngineeringConfig(tenant) first`);
  }
  return configCache.tenantConfig;
}

/**
 * Get current tenant key
 */
export function getCurrentTenant(): TenantKey {
  if (!configCache) {
    throw new Error(`Config not initialized! Call initializeDataEngineeringConfig(tenant) first`);
  }
  return configCache.currentTenant;
}

/**
 * Check if ABAC tenant is active
 */
export function isAbacTenant(): boolean {
  return configCache?.currentTenant === 'abac';
}

/**
 * Clear the configuration cache
 */
export function clearDataEngineeringConfigCache(): void {
  configCache = null;
}
