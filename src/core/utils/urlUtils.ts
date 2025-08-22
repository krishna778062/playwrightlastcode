import { BACKEND_URLS } from '../constants/urls';

/**
 * Gets the internal backend URL based on the environment domain
 * @param appUrl - The application URL (e.g., simpplr-demo.uat.simpplr.xyz)
 * @returns The corresponding internal backend URL
 */
export const getInternalBackendUrl = (appUrl: string): string => {
  if (!appUrl) {
    throw new Error('App URL is required to determine backend URL');
  }

  const domain = Object.keys(BACKEND_URLS).find(key => appUrl.includes(key));
  if (!domain) {
    throw new Error(`Backend URL is not found for the given app URL : ${appUrl}`);
  }

  return BACKEND_URLS[domain as keyof typeof BACKEND_URLS];
};

/**
 * Constructs a site dashboard URL based on the given site ID
 * @param siteId - The ID of the site
 * @param baseUrl - Optional base URL, defaults to FRONTEND_BASE_URL environment variable
 * @returns The complete site dashboard URL
 */
export const getSiteDashboardUrl = (siteId: string, baseUrl?: string): string => {
  if (!siteId) {
    throw new Error('Site ID is required to construct site dashboard URL');
  }

  const frontendBaseUrl = baseUrl || process.env.FRONTEND_BASE_URL;
  if (!frontendBaseUrl) {
    throw new Error(
      'Frontend base URL is required. Please provide baseUrl parameter or set FRONTEND_BASE_URL environment variable'
    );
  }

  return `${frontendBaseUrl}/site/${siteId}/dashboard`;
};
