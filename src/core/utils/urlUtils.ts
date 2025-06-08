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
