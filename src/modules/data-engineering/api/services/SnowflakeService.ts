import { decodeBase64 } from '@data-engineering/helpers/base64Helper';
import crypto from 'crypto';
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
    const privateKey = this.loadPrivateKeyFromEnv();

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
   * Loads and processes the private key from environment variables
   * The private key and passphrase should be Base64 encoded in the .env file
   */
  private static loadPrivateKeyFromEnv(): string {
    const encodedPrivateKey = process.env.SNOWFLAKE_PRIVATE_KEY;
    const encodedPassphrase = process.env.SNOWFLAKE_PASSPHRASE;

    if (!encodedPrivateKey) {
      throw new Error('SNOWFLAKE_PRIVATE_KEY environment variable is required (Base64 encoded)');
    }

    if (!encodedPassphrase) {
      throw new Error('SNOWFLAKE_PASSPHRASE environment variable is required (Base64 encoded)');
    }

    // Decode Base64 encoded strings (similar to Java's Base64.getDecoder().decode())
    const privateKeyPem = decodeBase64(encodedPrivateKey);
    const passphrase = decodeBase64(encodedPassphrase);

    // Decrypt the private key using the passphrase
    const privateKeyObject = crypto.createPrivateKey({
      key: privateKeyPem,
      format: 'pem',
      passphrase: passphrase,
    });

    // Export the decrypted private key
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
