import snowflake, { Connection, RowStatement } from 'snowflake-sdk';

export type SnowflakeConfig = {
  account: string;
  username: string;
  password: string;
  warehouse?: string;
  database?: string;
  schema?: string;
  role?: string;
  application?: string;
};

export class SnowflakeService {
  private connection: Connection;

  constructor(private config: SnowflakeConfig) {
    this.connection = snowflake.createConnection({
      account: config.account,
      username: config.username,
      password: config.password,
      warehouse: config.warehouse,
      database: config.database,
      schema: config.schema,
      role: config.role,
      application: config.application || 'central-ui-automation',
    });
  }

  static fromEnv(): SnowflakeService {
    return new SnowflakeService({
      account: process.env.SNOWFLAKE_ACCOUNT || '',
      username: process.env.SNOWFLAKE_USERNAME || '',
      password: process.env.SNOWFLAKE_PASSWORD || '',
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      role: process.env.SNOWFLAKE_ROLE,
    });
  }

  connect(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      this.connection.connect((err: Error | undefined, conn: Connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    });
  }

  execute<T = any>(sqlText: string, binds?: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText,
        binds,
        complete: (err: Error | undefined, stmt: RowStatement, rows: T[] | undefined) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        },
      });
    });
  }

  destroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.destroy((err?: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
