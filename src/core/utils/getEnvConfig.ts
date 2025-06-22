export type EnvConfig = {
  tenantOrgId: string;
  appManagerEmail: string;
  appManagerPassword: string;
  frontendBaseUrl: string;
  apiBaseUrl: string;
};

export const getEnvConfig = (): EnvConfig => ({
  tenantOrgId: requireEnvVar('ORG_ID'),
  appManagerEmail: requireEnvVar('APP_MANAGER_USERNAME'),
  appManagerPassword: requireEnvVar('APP_MANAGER_PASSWORD'),
  frontendBaseUrl: requireEnvVar('FRONTEND_BASE_URL'),
  apiBaseUrl: requireEnvVar('API_BASE_URL'),
});

/**
 * @param key - The environment variable key to retrieve
 * @returns The value of the environment variable
 * @throws An error if the environment variable is not set
 */
export function requireEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}
