// Optional import for content module config
let contentConfigModule: any;
try {
  contentConfigModule = require('@/src/modules/content/config/contentConfig');
} catch {
  // Content module not available - this is expected for non-content modules
  contentConfigModule = null;
}

export type EnvConfig = {
  tenantOrgId?: string;
  appManagerEmail: string;
  appManagerPassword: string;
  userManagerEmail?: string;
  frontendBaseUrl: string;
  apiBaseUrl: string;
  apiBaseUrlPD?: string;
  newUxEnabled: boolean;
  tenantUserRoleId?: string;
  //optional env variables (might be required for few modules)
  endUserEmail?: string;
  endUserPassword?: string;
  siteManagerEmail?: string;
  siteManagerPassword?: string;
  socialCampaignManagerEmail?: string;
  socialCampaignManagerPassword?: string;
  promotionManagerEmail?: string;
  promotionManagerPassword?: string;
};

export const getEnvConfig = (): EnvConfig => {
  // Check if content module config is available and initialized
  // If so, use it instead of environment variables
  if (contentConfigModule?.isContentConfigInitialized?.()) {
    const contentConfig = contentConfigModule.getContentTenantConfigFromCache();
    return {
      tenantOrgId: contentConfig.orgId,
      appManagerEmail: contentConfig.appManagerEmail,
      appManagerPassword: contentConfig.appManagerPassword,
      userManagerEmail: undefined, // Not in content config
      frontendBaseUrl: contentConfig.frontendBaseUrl,
      apiBaseUrl: contentConfig.apiBaseUrl,
      apiBaseUrlPD: undefined, // Not in content config
      newUxEnabled: contentConfig.newUxEnabled,
      tenantUserRoleId: undefined, // Not in content config
      endUserEmail: contentConfig.endUserEmail,
      endUserPassword: contentConfig.endUserPassword,
      siteManagerEmail: contentConfig.siteManagerEmail,
      siteManagerPassword: contentConfig.siteManagerPassword,
      socialCampaignManagerEmail: contentConfig.socialCampaignManagerEmail,
      socialCampaignManagerPassword: contentConfig.socialCampaignManagerPassword,
      promotionManagerEmail: undefined, // Not in content config
      promotionManagerPassword: undefined, // Not in content config
    };
  }

  // Fall back to environment variables (for modules using .env files)
  return {
    tenantOrgId: getEnvVar('ORG_ID', false),
    appManagerEmail: getEnvVar('APP_MANAGER_USERNAME', true)!,
    userManagerEmail: getEnvVar('USER_MANAGER_USERNAME', false)!,
    appManagerPassword: getEnvVar('APP_MANAGER_PASSWORD', true)!,

    frontendBaseUrl: getEnvVar('FRONTEND_BASE_URL', true)!,
    apiBaseUrl: getEnvVar('API_BASE_URL', true)!,
    apiBaseUrlPD: getEnvVar('API_BASE_URL_PD', false),
    newUxEnabled: getEnvVar('NEW_UX_ENABLED', false) === 'true' || false,
    tenantUserRoleId: getEnvVar('TENANT_USER_ROLE_ID', false),

    //optional env variables (might be required for few modules)
    endUserEmail: getEnvVar('END_USER_USERNAME', false)!,
    endUserPassword: getEnvVar('END_USER_PASSWORD', false)!,

    siteManagerEmail: getEnvVar('SITE_MANAGER_USERNAME', false)!,
    siteManagerPassword: getEnvVar('SITE_MANAGER_PASSWORD', false)!,

    socialCampaignManagerEmail: getEnvVar('SOCIAL_CAMPAIGN_MANAGER', false)!,
    socialCampaignManagerPassword: getEnvVar('SOCIAL_CAMPAIGN_PASSWORD', false)!,

    promotionManagerEmail: getEnvVar('PROMOTION_MANAGER_USERNAME', false)!,
    promotionManagerPassword: getEnvVar('PROMOTION_MANAGER_PASSWORD', false)!,
  };
};

/**
 * @param key - The environment variable key to retrieve
 * @returns The value of the environment variable
 * @throws An error if the environment variable is not set
 */
export function getEnvVar(key: string, required = true): string | undefined {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}
