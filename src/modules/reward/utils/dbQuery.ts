import * as fs from 'fs';
import * as path from 'path';

const queriesPath = path.resolve(__dirname, 'dbQueries.json');
const rawData = fs.readFileSync(queriesPath, 'utf-8');
const queryMap = JSON.parse(rawData);

/**
 * Gets a SQL query by key
 * @param key The name of the query defined in dbQueries.json
 * @returns SQL query string
 */
export function getQuery(key: string): string {
  const query = queryMap[key];
  if (!query) {
    throw new Error(`Query not found for key: ${key}`);
  }
  return query;
}
