export type TenantKey = 'primary' | 'onlyPeerToPeer' | 'ABACEnabled';
export type EnvironmentKey =
  | 'qa'
  | 'test'
  | 'uat'
  | 'uatAU'
  | 'uatCA'
  | 'uatEU'
  | 'prodUS'
  | 'prodAU'
  | 'prodCA'
  | 'prodEU';

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
  siteName?: string;
  siteId?: string;
  audience?: string;
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
      frontendBaseUrl: 'https://reco-auto.qa.simpplr.xyz',
      apiBaseUrl: 'https://reco-auto-api.qa.simpplr.xyz',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: '9b2312c3-66d4-4662-b37b-f60626ee393f',
      appManagerPassword: 'simpplr123',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: '29b876a8-e690-4a7c-bd6d-370179a051af',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+2@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: 'cb2222c7-69b0-42ea-97b4-20bb126713a6',
      endUserPassword: 'simpplr123',
      siteName: 'recognition_automation_site',
      siteId: '8f87117a-8f62-47e8-9a17-34cf90179880',
      audience: 'recognition_automation_audience_do_not_delete',
      newUxEnabled: true,
    },
    test: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://reco-automation.test.simpplr.xyz',
      apiBaseUrl: 'https://reco-automation-api.test.simpplr.xyz',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'f12a51ca-528c-4236-9f15-343901d489db',
      appManagerPassword: 'simpplr123',
      recognitionManagerEmail: 'aishma.gupta+5@simpplr.com',
      recognitionManagerName: 'Recognition User',
      recognitionManagerUserId: '27f7f0df-2783-49f2-b989-c170f520421f',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+1@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: 'd4d82341-04e6-459a-b9ae-cda3e9a17ed8',
      endUserPassword: 'simpplr123',
      siteName: 'recognition_automation_site',
      siteId: '8f87117a-8f62-47e8-9a17-34cf90179880',
      audience: 'recognition_automation_audience_do_not_delete',
      newUxEnabled: true,
    },
    uat: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://reco.uat.simpplr.xyz',
      apiBaseUrl: 'https://reco-api.uat.simpplr.xyz',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'simpplr123',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+2@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'simpplr123',
      newUxEnabled: true,
    },
    uatEU: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://rewards.uat-eu.simpplr.xyz',
      apiBaseUrl: 'https://rewards-api.uat-eu.simpplr.xyz',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'simpplr123',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+2@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'simpplr123',
      newUxEnabled: true,
    },
    uatAU: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://king-in-the-north.uat-au.simpplr.com',
      apiBaseUrl: 'https://king-in-the-north-api.uat-au.simpplr.com',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: '4b2bf839-c7ff-4b5f-a766-f2333b5e46dd',
      appManagerPassword: 'Simpplr@1234',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+2@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: 'f1aedfe7-d908-4d4a-a5d5-2d57faf0e80f',
      endUserPassword: 'Simpplr@1234',
      newUxEnabled: true,
    },
    uatCA: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://the-maze-runner-1.uat-ca.simpplr.com',
      apiBaseUrl: 'https://the-maze-runner-1-api.uat-ca.simpplr.com',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: '74fed0ff-4bd4-4003-b51c-2d017168a494',
      appManagerPassword: 'Simpplr@12345',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+2@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: '9615aed4-d65b-45bd-9de5-0cc84d60d89e',
      endUserPassword: 'Simpplr@12345',
      newUxEnabled: true,
    },
    prodUS: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://recognitiontest.app.simpplr.com',
      apiBaseUrl: 'https://recognitiontest-api.app.simpplr.com',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'simpplr123',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+2@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'simpplr123',
      newUxEnabled: true,
    },
    prodEU: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://zeus.eu.simpplr.com',
      apiBaseUrl: 'https://zeus-api.eu.simpplr.com',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'Simpplr@12345',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+2@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'Simpplr@12345',
      newUxEnabled: true,
    },
    prodCA: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://winter-is-coming-1.ca.simpplr.com',
      apiBaseUrl: 'https://winter-is-coming-1-api.ca.simpplr.com',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'simpplr123',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+2@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'simpplr123',
      newUxEnabled: true,
    },
    prodAU: {
      tenantName: 'Recognition Primary',
      frontendBaseUrl: 'https://au-5.au.simpplr.com',
      apiBaseUrl: 'https://au-5-api.au.simpplr.com',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'c42b4bf9-870a-46ec-86c8-ece90b278ad9',
      appManagerPassword: 'simpplr123',
      recognitionManagerEmail: 'sonu.kumar@simpplr.com',
      recognitionManagerName: 'Aishma RecoManager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'simpplr123',
      endUserEmail: 'aishma.gupta+2@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: '2affbcf8-a848-4eb0-8ff7-71db03b59ac1',
      endUserPassword: 'simpplr123',
      newUxEnabled: true,
    },
  },
  onlyPeerToPeer: {
    test: {
      tenantName: 'Recognition P2P Primary',
      frontendBaseUrl: 'https://p2ptestenv.test.simpplr.xyz',
      apiBaseUrl: 'https://p2ptestenv-api.test.simpplr.xyz',
      appManagerEmail: 'charan.b@simpplr.com',
      appManagerName: 'Charan B',
      appManagerUserId: 'ee0064e0-db80-44f3-baa2-528014f9e88e',
      appManagerPassword: 'Simpplr@12345',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'sonu.kumar+3@simpplr.com',
      endUserName: 'Charan 2',
      endUserUserId: 'e5d462a5-f658-4764-bce7-20813ce20198',
      endUserPassword: 'Simpplr123',
      newUxEnabled: true,
    },
    qa: {
      tenantName: 'Recognition P2P Primary',
      frontendBaseUrl: 'https://p2p-only-testing.qa.simpplr.xyz',
      apiBaseUrl: 'https://p2p-only-testing-api.qa.simpplr.xyz',
      appManagerEmail: 'charan.b@simpplr.com',
      appManagerName: 'Charan B',
      appManagerUserId: '856cf3e3-40ee-46e1-a3b1-4be262217089',
      appManagerPassword: 'Simpplr@1234',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'sonu.kumar+3@simpplr.com',
      endUserName: 'Priya Singh',
      endUserUserId: 'c1fed284-175c-4384-a3b2-5564fa1c4901',
      endUserPassword: 'Simpplr123',
      newUxEnabled: true,
    },
  },
  ABACEnabled: {
    test: {
      tenantName: 'Recognition ABAC Enabled',
      frontendBaseUrl: 'https://abac.test.simpplr.xyz',
      apiBaseUrl: 'https://abac-api.test.simpplr.xyz',
      appManagerEmail: 'aishma.gupta@simpplr.com',
      appManagerName: 'Aishma Gupta',
      appManagerUserId: 'debe8950-bca5-41d0-9aa9-4fe65afebca7',
      appManagerPassword: 'Simpplr@12345',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'aishma.gupta+1@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: 'b46a7791-55f7-4d31-b902-b9710951ee48',
      endUserPassword: 'Simpplr@12345',
      newUxEnabled: true,
    },
    qa: {
      tenantName: 'Recognition ABAC Enabled',
      frontendBaseUrl: 'https://abac.qa.simpplr.xyz',
      apiBaseUrl: 'https://abac.qa.simpplr.xyz',
      appManagerEmail: 'keerthana.ks@simpplr.com',
      appManagerName: 'Keerthana Ks',
      appManagerUserId: '02e75451-4ff6-42e8-ac17-2ee52cb04407',
      appManagerPassword: 'Simpplr@12345',
      recognitionManagerEmail: 'sonu.kumar+2@simpplr.com',
      recognitionManagerName: 'Recognition Manager',
      recognitionManagerUserId: 'a5796274-2d24-49c2-be22-c9defdc37311',
      recognitionManagerPassword: 'Simpplr123',
      endUserEmail: 'aishma.gupta+1@simpplr.com',
      endUserName: 'aishma enduser',
      endUserUserId: '9489122f-089e-4cd3-9b7f-ccc6bdc19b80',
      endUserPassword: 'Simpplr@12345',
      newUxEnabled: true,
    },
  },
  appConfig: {
    staticFolderPath: '',
  },
};

// Environment resolution helpers ------------------------------------------------

/**
 * Get current environment from TEST_ENV (required).
 * Throws an error if TEST_ENV is not set or invalid.
 */
export function getCurrentEnvironment(): EnvironmentKey {
  const testEnv = process.env.TEST_ENV || 'qa';

  const allowedEnvs: EnvironmentKey[] = [
    'qa',
    'test',
    'uat',
    'uatAU',
    'uatCA',
    'uatEU',
    'prodUS',
    'prodAU',
    'prodCA',
    'prodEU',
  ];

  if (!allowedEnvs.includes(testEnv as EnvironmentKey)) {
    throw new Error(
      `❌ Invalid TEST_ENV value: '${testEnv}'\n` +
        `Valid values are: ${allowedEnvs.join(', ')}\n` +
        `Example: TEST_ENV=qa npm run test\n` +
        `Example: TEST_ENV=uat npm run test\n` +
        `Example: TEST_ENV=prodUS npm run test\n` +
        `Example: TEST_ENV=prodAU npm run test\n` +
        `Example: TEST_ENV=prodCA npm run test\n` +
        `Example: TEST_ENV=prodEU npm run test\n` +
        `Example: TEST_ENV=uatAU npm run test\n` +
        `Example: TEST_ENV=uatCA npm run test\n` +
        `Example: TEST_ENV=test npm run test\n`
    );
  }

  return testEnv as EnvironmentKey;
}

/**
 * Initialize config cache for specific tenant once per test run.
 * Call this at the start of your test suite with the tenant you're testing.
 */
export function initializeRecognitionConfig(tenant: TenantKey): void {
  const caller = getCallerInfo();

  if (configCache?.currentTenant === tenant) {
    console.log(`🔧 Config already initialized for tenant: ${tenant} (called from: ${caller})`);
    return;
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
 * Get tenant configuration for current environment (from cache).
 */
export function getRecognitionTenantConfigFromCache(): RecognitionTenantConfig {
  if (!configCache) {
    throw new Error(`❌ Config not initialized! Call initializeRecognitionConfig(tenant) first`);
  }

  return configCache.tenantConfig;
}
