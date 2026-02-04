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
export type EnvironmentKey =
  | 'qa'
  | 'test'
  | 'uat'
  | 'uatAU'
  | 'uatCA'
  | 'uatEU'
  | 'prodUS'
  | 'prodEU'
  | 'prodAU'
  | 'prodCA';

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
      frontendBaseUrl: 'https://de-auto.test.simpplr.xyz',
      apiBaseUrl: 'https://de-auto-api.test.simpplr.xyz',
      apiBeUrl: 'https://api-be.test.simpplr.xyz',
      appManagerEmail: 'bharat.madaan@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'simpplr.dev+amber.rich@example.com',
      standardUserPassword: 'Simpplr@123',
      orgId: '7d21708d-908a-4c60-b1b7-5d6647ee112c',
      odinOrgId: '00D8Y000000g1g2UAA',
    },
    qa: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://zeus-auto.qa.simpplr.xyz',
      apiBaseUrl: 'https://zeus-auto-api.qa.simpplr.xyz',
      apiBeUrl: 'https://zeus-api-be.qa.simpplr.xyz',
      appManagerEmail: 'divyansh.kumar@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'adil.shamim+2@simpplr.com',
      standardUserPassword: 'Simpplr@2025',
      orgId: '05913951-3f4a-417c-bf97-8c470b576a34',
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
    uatAU: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://king-in-the-north.uat-au.simpplr.com',
      apiBaseUrl: 'https://king-in-the-north-api.uat-au.simpplr.com',
      apiBeUrl: 'https://api-be.uat-au.simpplr.com',
      appManagerEmail: 'amit.verma@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'aishma.gupta+2@simpplr.com',
      standardUserPassword: 'Simpplr@123',
      orgId: '096fb4bf-a52c-41af-9bf8-904ed4fa602a',
      odinOrgId: 'uat-au-odin-org-id',
    },
    uatCA: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://the-maze-runner-1.uat-ca.simpplr.com',
      apiBaseUrl: 'https://the-maze-runner-1-api.uat-ca.simpplr.com',
      apiBeUrl: 'https://api-be.uat-ca.simpplr.com',
      appManagerEmail: 'parul.sharma@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'aishma.gupta+5@simpplr.com',
      standardUserPassword: 'Simpplr@123',
      orgId: 'fd12a72a-b0fc-42b5-a5fb-61ed3f178519',
      odinOrgId: 'uat-ca-odin-org-id',
    },
    uatEU: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://de-auto.uat-eu.simpplr.com',
      apiBaseUrl: 'https://de-auto-api.uat-eu.simpplr.com',
      apiBeUrl: 'https://api-be.uat-eu.simpplr.com',
      appManagerEmail: 'bharat.madaan@simpplr.com',
      appManagerPassword: 'Simpplr@123',
      standardUserEmail: 'simpplr.dev+amber.rich@example.com',
      standardUserPassword: 'Simpplr@123',
      orgId: '039a0ab4-d82d-4d79-9d53-8b2b41754cd5',
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
    prodEU: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://zeus.eu.simpplr.com/',
      apiBaseUrl: 'https://zeus-api.eu.simpplr.com',
      apiBeUrl: 'https://api-be.eu.simpplr.com',
      appManagerEmail: 'divya.jain@simpplr.com',
      appManagerPassword: 'Simpplr@1234',
      standardUserEmail: 'adil.shamim@simpplr.com',
      standardUserPassword: 'Simpplr@1234',
      orgId: '40909597-98d6-440e-9d08-c8ed8c2761ea',
    },
    prodAU: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://au-5.au.simpplr.com/',
      apiBaseUrl: 'https://au5-api.au.simpplr.com',
      apiBeUrl: 'https://api-be.au.simpplr.com',
      appManagerEmail: 'parul.sharma@simpplr.com',
      appManagerPassword: 'Simpplr@1234',
      standardUserEmail: '',
      standardUserPassword: '',
      orgId: 'fcab0fbd-2288-495a-982e-e8f90a016719',
    },
    prodCA: {
      tenantName: 'Data Engineering Primary',
      frontendBaseUrl: 'https://winter-is-coming-1.ca.simpplr.com/',
      apiBaseUrl: 'https://winter-is-coming-1-api.ca.simpplr.com',
      apiBeUrl: 'https://api-be.ca.simpplr.com',
      appManagerEmail: 'parul.sharma@simpplr.com',
      appManagerPassword: 'Simpplr@1234',
      standardUserEmail: '',
      standardUserPassword: '',
      orgId: 'b8fd4d0e-5b38-433e-982f-e216a510873a',
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

  const validEnvs: EnvironmentKey[] = [
    'qa',
    'test',
    'uat',
    'uatAU',
    'uatCA',
    'uatEU',
    'prodUS',
    'prodEU',
    'prodAU',
    'prodCA',
  ];
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
  if (configCache?.currentTenant === tenant) {
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
