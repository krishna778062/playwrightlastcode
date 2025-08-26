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
 * Constructs an album URL for the frontend
 * @param siteId - The site ID
 * @param albumId - The album ID
 * @param baseUrl - Optional frontend base URL (e.g., https://simpplr-demo.uat.simpplr.xyz). Falls back to FRONTEND_BASE_URL env var
 * @returns The complete album URL
 */
export const getAlbumUrl = (siteId: string, albumId: string, baseUrl?: string): string => {
  const frontendBaseUrl = baseUrl || process.env.FRONTEND_BASE_URL;
  if (!siteId) {
    throw new Error('Site ID is required');
  }
  if (!albumId) {
    throw new Error('Album ID is required');
  }

  if (!frontendBaseUrl) {
    throw new Error(
      'Frontend base URL is required. Please provide baseUrl parameter or set FRONTEND_BASE_URL environment variable'
    );
  }

  return `${frontendBaseUrl}/site/${siteId}/album/${albumId}`;
};
