import dotenv from 'dotenv';
import path from 'path';
import { Environments } from '@core/constants/environments';
import { PROJECT_ROOT } from '../constants/paths';
import { FileUtil } from './fileUtil';

export function loadEnvVariablesForGivenModule(envName: Environments, moduleName: string) {
  // Resolve path relative to project root
  const envPath = path.resolve(PROJECT_ROOT, `src/modules/${moduleName}/env/${envName}.env`);
  //IF FILE DOES NOT EXIST THEN RAISE AN ERROR
  if (!FileUtil.fileExists(envPath)) {
    throw new Error(`Environment file not found at this given path: ${envPath}`);
  }
  console.log(`Loading env variables from: ${envPath}`);
  dotenv.config({ path: envPath });
  console.log('Environment variables loaded successfully');
}
