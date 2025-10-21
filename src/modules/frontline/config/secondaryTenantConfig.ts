import { getFrontlineTenantConfigFor, initializeFrontlineConfig } from '../config/frontlineConfig';

/**
 * Secondary Tenant Configuration
 *
 * This file handles all secondary tenant-specific configuration for OTP tests.
 * It should be imported by any test files that need to run on the secondary tenant.
 */

// Initialize secondary tenant configuration
initializeFrontlineConfig('secondary');

// Export the secondary tenant config for use in tests
export const secondaryTenantConfig = getFrontlineTenantConfigFor('secondary');

// Export helper functions for secondary tenant tests
export const getSecondaryConfig = () => secondaryTenantConfig;

export const getSecondaryTenantName = () => secondaryTenantConfig.tenantName;
export const getSecondaryFrontendUrl = () => secondaryTenantConfig.frontendBaseUrl;
export const getSecondaryApiUrl = () => secondaryTenantConfig.apiBaseUrl;
export const getSecondaryOrgId = () => secondaryTenantConfig.orgId;

// OTP helper functions
export const getSecondaryMailosaurApiKey = () => secondaryTenantConfig.mailosaurApiKey;
export const getSecondaryMailosaurServerId = () => secondaryTenantConfig.mailosaurServerId;

// Log initialization
console.log(`🔧 Secondary tenant initialized: ${secondaryTenantConfig.tenantName}`);
console.log(`🔧 Frontend URL: ${secondaryTenantConfig.frontendBaseUrl}`);
console.log(`🔧 API URL: ${secondaryTenantConfig.apiBaseUrl}`);
