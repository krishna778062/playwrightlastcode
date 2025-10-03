import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import snowflake, { Connection, RowStatement } from 'snowflake-sdk';

export type SnowflakeConfig = {
  account: string;
  username: string;
  password: string;
  warehouse?: string;
  database?: string;
  authenticator?: string;
  privateKey: string;
  application?: string;
};

export class SnowflakeService {
  private connection: Connection;
  private config: SnowflakeConfig;

  constructor(config: SnowflakeConfig) {
    this.config = config;
    this.connection = this.createConnection();
  }

  /**
   * Factory method to create SnowflakeService from environment variables
   */
  static fromEnv(): SnowflakeService {
    const privateKey = this.loadPrivateKeyFromFile();

    const config: SnowflakeConfig = {
      account: process.env.SNOWFLAKE_ACCOUNT || '',
      username: process.env.SNOWFLAKE_USER_NAME || '',
      password: process.env.SNOWFLAKE_USER_PASSWORD || '',
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || '',
      database: process.env.SNOWFLAKE_DATABASE || '',
      authenticator: 'SNOWFLAKE_JWT',
      privateKey: privateKey,
    };

    return new SnowflakeService(config);
  }

  /**
   * Loads and processes the private key from the RSA key file
   */
  private static loadPrivateKeyFromFile(): string {
    const privateKeyPath = path.resolve(__dirname, '../../rsa_key.p8');
    const passphrase = process.env.SNOWFLAKE_PASSPHRASE;

    if (!passphrase) {
      throw new Error('SNOWFLAKE_PASSPHRASE environment variable is required');
    }

    const privateKeyFile = fs.readFileSync(privateKeyPath);

    const privateKeyObject = crypto.createPrivateKey({
      key: privateKeyFile,
      format: 'pem',
      passphrase: passphrase,
    });

    const privateKey = privateKeyObject.export({
      format: 'pem',
      type: 'pkcs8',
    });

    return privateKey.toString();
  }

  /**
   * Creates a Snowflake connection with the provided configuration
   */
  private createConnection(): Connection {
    return snowflake.createConnection({
      account: this.config.account,
      username: this.config.username,
      password: this.config.password,
      warehouse: this.config.warehouse,
      database: this.config.database,
      authenticator: this.config.authenticator,
      privateKey: this.config.privateKey,
    });
  }

  /**
   * Establishes connection to Snowflake
   */
  connect(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      this.connection.connect((err: Error | undefined, conn: Connection) => {
        if (err) {
          reject(new Error(`Failed to connect to Snowflake: ${err.message}`));
        } else {
          resolve(conn);
        }
      });
    });
  }

  /**
   * Executes a SQL query on Snowflake
   */
  execute<T = any>(sqlText: string, binds?: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText,
        binds,
        complete: (err: Error | undefined, stmt: RowStatement, rows: T[] | undefined) => {
          if (err) {
            reject(new Error(`Failed to execute query: ${err.message}`));
          } else {
            resolve(rows || []);
          }
        },
      });
    });
  }

  /**
   * Closes the Snowflake connection
   */
  destroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.destroy((err?: Error) => {
        if (err) {
          reject(new Error(`Failed to destroy connection: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Gets the current connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }
}
