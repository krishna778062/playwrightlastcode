import dotenv from 'dotenv';
import path from 'path';
import { Environments } from '@core/constants/environments';
import { PROJECT_ROOT } from '../constants/paths';

export function loadEnvVariablesForGivenModule(envName: Environments, moduleName: string) {
  // Resolve path relative to project root
  const envPath = path.resolve(PROJECT_ROOT, `src/modules/${moduleName}/env/${envName}.env`);
  console.log(`Loading env variables from: ${envPath}`);
  dotenv.config({ path: envPath });
  console.log('Environment variables loaded successfully');
}
