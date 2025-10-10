/**
 * Utility functions for API URL resolution and management
 */

const BACKEND_URLS = {
  'test.simpplr.xyz': 'https://api-be.test.simpplr.xyz',
  'uat.simpplr.xyz': 'https://api-be.uat.simpplr.xyz',
  'dev.simpplr.xyz': 'https://api-be.dev.simpplr.xyz',
  'app.simpplr.xyz': 'https://api-be.app.simpplr.xyz',
  'qa.simpplr.xyz': 'https://api-be.qa.simpplr.xyz',
  'perf.simpplr.xyz': 'https://api-be.perf.simpplr.xyz',
} as const;

/**
 * Resolves the internal backend URL based on the frontend app URL
 * @param appUrl - The frontend application URL
 * @returns The corresponding backend API URL
 * @throws Error if the app URL is not provided or not found in the mapping
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
 * Resolves backend URL from environment variable or provided URL
 * @param baseUrl - Optional base URL, if not provided will use FRONTEND_BASE_URL env var
 * @returns The resolved backend URL
 */
export const resolveBackendUrl = (baseUrl?: string): string => {
  const appUrl = baseUrl || process.env.FRONTEND_BASE_URL;
  if (!appUrl) {
    throw new Error('Either baseUrl parameter or FRONTEND_BASE_URL environment variable must be provided');
  }
  return getInternalBackendUrl(appUrl);
};
