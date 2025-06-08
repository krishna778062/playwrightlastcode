import dotenv from 'dotenv';
import path from 'path';
import { Environments } from '@core/constants/environments';

export function loadEnvVariables(envName: Environments) {
  // Resolve path relative to project root
  const envPath = path.resolve(process.cwd(), `./env/${envName}.env`);
  console.log(`Loading env variables from: ${envPath}`);
  dotenv.config({ path: envPath });
  console.log('Environment variables loaded successfully');
}
