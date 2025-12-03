import dotenv from 'dotenv';
import path from 'path';

import { Environments } from '@core/constants/environments';
import { Modules } from '@core/constants/modules';
import { log } from '@core/utils';

import { PROJECT_ROOT } from '../constants/paths';

import { FileUtil } from './fileUtil';

export function loadEnvVariablesForGivenModule(envName: Environments, moduleName: string) {
  // Content module uses contentConfig.ts instead of .env files
  if (moduleName === Modules.CONTENT) {
    log.info(`Skipping env file loading for content module (uses contentConfig.ts instead).`, {
      module: 'envLoader',
      envName,
      moduleName,
    });
    return;
  }

  // Frontline module uses frontlineConfig.ts instead of .env files
  if (moduleName === Modules.FRONTLINE) {
    log.info(`Skipping env file loading for frontline module (uses frontlineConfig.ts instead).`, {
      module: 'envLoader',
      envName,
      moduleName,
    });
    return;
  }

  // Resolve paths relative to project root
  const envPath = path.resolve(PROJECT_ROOT, `src/modules/${moduleName}/env/${envName}.env`);
  const googleCalendarSecretsPath = path.resolve(
    PROJECT_ROOT,
    `src/modules/${moduleName}/env/googleCalendarSecrets.env`
  );
  const outlookCalendarSecretsPath = path.resolve(
    PROJECT_ROOT,
    `src/modules/${moduleName}/env/outlookCalendarSecrets.env`
  );
  const githubSecretsPath = path.resolve(PROJECT_ROOT, 'githubSecrets.json');

  // Load main environment file first
  if (!FileUtil.fileExists(envPath)) {
    throw new Error(`Environment file not found at this given path: ${envPath}`);
  }
  dotenv.config({ path: envPath });

  // Check if running in CI and load from GitHub secrets JSON
  if (process.env.CI && FileUtil.fileExists(githubSecretsPath)) {
    try {
      const secretsContent = require('fs').readFileSync(githubSecretsPath, 'utf8');
      const secrets = JSON.parse(secretsContent);

      const requiredKeys = [
        'GOOGLE_CALENDAR_CLIENT_ID',
        'GOOGLE_CALENDAR_CLIENT_SECRET',
        'GOOGLE_CALENDAR_REFRESH_TOKEN',
        'END_USER_GOOGLE_CALENDAR_CLIENT_ID',
        'END_USER_GOOGLE_CALENDAR_CLIENT_SECRET',
        'END_USER_GOOGLE_CALENDAR_REFRESH_TOKEN',
        'OUTLOOK_CLIENT_ID',
        'OUTLOOK_CLIENT_SECRET',
        'OUTLOOK_REFRESH_TOKEN',
        'END_USER_OUTLOOK_CLIENT_ID',
        'END_USER_OUTLOOK_CLIENT_SECRET',
        'END_USER_OUTLOOK_REFRESH_TOKEN',
      ];

      for (const key of requiredKeys) {
        if (secrets[key]) {
          process.env[key] = secrets[key];
        }
      }
    } catch (error) {
      log.error('Failed to parse GitHub secrets JSON', error, { module: 'envLoader' });
    }
  }
  // Load Google Calendar secrets file if it exists (for local development)
  else if (FileUtil.fileExists(googleCalendarSecretsPath)) {
    dotenv.config({ path: googleCalendarSecretsPath, override: true });
  }

  // Load Outlook Calendar secrets file if it exists (for local development)
  if (FileUtil.fileExists(outlookCalendarSecretsPath)) {
    dotenv.config({ path: outlookCalendarSecretsPath, override: true });
  }
}
