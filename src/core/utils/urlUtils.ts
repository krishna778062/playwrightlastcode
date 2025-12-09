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
 * Extracts the site ID from a Simpplr URL
 * @param url - The URL containing the site ID (e.g., https://chat1.uat.simpplr.xyz/site/b3e2e8b1-98ec-4a08-903e-0c71873785a6/page/add)
 * @returns The site ID (UUID) or null if not found
 */
export const extractSiteIdFromContentAdditionUrl = (url: string): string | null => {
  if (!url) {
    return null;
  }

  // Regex pattern to match site ID (UUID) after /site/ in the URL
  const siteIdPattern = /\/site\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
  const match = url.match(siteIdPattern);

  return match ? match[1] : null;
};
