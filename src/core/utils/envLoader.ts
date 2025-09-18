import dotenv from 'dotenv';
import path from 'path';

import { Environments } from '@core/constants/environments';

import { PROJECT_ROOT } from '../constants/paths';

import { FileUtil } from './fileUtil';

export function loadEnvVariablesForGivenModule(envName: Environments, moduleName: string) {
  // Resolve paths relative to project root
  const envPath = path.resolve(PROJECT_ROOT, `src/modules/${moduleName}/env/${envName}.env`);
  const googleCalendarSecretsPath = path.resolve(
    PROJECT_ROOT,
    `src/modules/${moduleName}/env/googleCalendarSecrets.env`
  );

  // Load main environment file first
  if (!FileUtil.fileExists(envPath)) {
    throw new Error(`Environment file not found at this given path: ${envPath}`);
  }
  console.log(`Loading env variables from: ${envPath}`);
  dotenv.config({ path: envPath });

  // Load Google Calendar secrets file if it exists (overrides main env values)
  if (FileUtil.fileExists(googleCalendarSecretsPath)) {
    console.log(`Loading Google Calendar secrets from: ${googleCalendarSecretsPath}`);
    dotenv.config({ path: googleCalendarSecretsPath, override: true });
  }

  // Fallback to GitHub environment variables for sensitive data
  if (!process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.CI_GOOGLE_CALENDAR_CLIENT_ID) {
    process.env.GOOGLE_CALENDAR_CLIENT_ID = process.env.CI_GOOGLE_CALENDAR_CLIENT_ID;
  }
  if (!process.env.GOOGLE_CALENDAR_CLIENT_SECRET && process.env.CI_GOOGLE_CALENDAR_CLIENT_SECRET) {
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET = process.env.CI_GOOGLE_CALENDAR_CLIENT_SECRET;
  }
  if (!process.env.GOOGLE_CALENDAR_REFRESH_TOKEN && process.env.CI_GOOGLE_CALENDAR_REFRESH_TOKEN) {
    process.env.GOOGLE_CALENDAR_REFRESH_TOKEN = process.env.CI_GOOGLE_CALENDAR_REFRESH_TOKEN;
  }
  if (!process.env.END_USER_GOOGLE_CALENDAR_CLIENT_ID && process.env.CI_END_USER_GOOGLE_CALENDAR_CLIENT_ID) {
    process.env.END_USER_GOOGLE_CALENDAR_CLIENT_ID = process.env.CI_END_USER_GOOGLE_CALENDAR_CLIENT_ID;
  }
  if (!process.env.END_USER_GOOGLE_CALENDAR_CLIENT_SECRET && process.env.CI_END_USER_GOOGLE_CALENDAR_CLIENT_SECRET) {
    process.env.END_USER_GOOGLE_CALENDAR_CLIENT_SECRET = process.env.CI_END_USER_GOOGLE_CALENDAR_CLIENT_SECRET;
  }
  if (!process.env.END_USER_GOOGLE_CALENDAR_REFRESH_TOKEN && process.env.CI_END_USER_GOOGLE_CALENDAR_REFRESH_TOKEN) {
    process.env.END_USER_GOOGLE_CALENDAR_REFRESH_TOKEN = process.env.CI_END_USER_GOOGLE_CALENDAR_REFRESH_TOKEN;
  }

  console.log('Environment variables loaded successfully');
}
