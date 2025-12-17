import { getSnowflakeConfig, SnowflakeEnvironmentConfig } from '@data-engineering/config/snowflakeConfig';
import { decodeBase64 } from '@data-engineering/helpers/base64Helper';
import crypto from 'crypto';
import snowflake, { Connection, RowStatement } from 'snowflake-sdk';

// Type for Snowflake parameter values (matches Snowflake SDK Bind type)
export type SnowflakeParamValue = string | number | boolean | Date | null | Buffer;

export type SnowflakeConnectionConfig = {
  account: string;
  username: string;
  password?: string;
  warehouse?: string;
  database?: string;
  authenticator?: string;
  privateKey?: string;
  application?: string;
};

export class SnowflakeService {
  private connection: Connection;
  private config: SnowflakeConnectionConfig;
  private isConnected: boolean = false;

  constructor(config: SnowflakeConnectionConfig) {
    this.config = config;
    this.connection = this.createConnection();
  }

  /**
   * Factory method to create SnowflakeService from snowflakeConfig
   * Uses the centralized configuration based on TEST_ENV
   */
  static fromConfig(): SnowflakeService {
    const envConfig = getSnowflakeConfig();
    const privateKey = envConfig.privateKey ? this.decryptPrivateKey(envConfig) : undefined;

    const config: SnowflakeConnectionConfig = {
      account: envConfig.account,
      username: envConfig.username,
      password: envConfig.password,
      warehouse: envConfig.warehouse,
      database: envConfig.database,
      authenticator: envConfig.privateKey ? 'SNOWFLAKE_JWT' : undefined,
      privateKey: privateKey,
    };

    return new SnowflakeService(config);
  }

  /**
   * @deprecated Use fromConfig() instead. This method is kept for backward compatibility.
   * Factory method to create SnowflakeService (now uses centralized config)
   */
  static fromEnv(): SnowflakeService {
    return this.fromConfig();
  }

  /**
   * Decrypts the private key using the passphrase from config
   * The private key and passphrase should be Base64 encoded
   */
  private static decryptPrivateKey(envConfig: SnowflakeEnvironmentConfig): string {
    const encodedPrivateKey = envConfig.privateKey;
    const encodedPassphrase = envConfig.passphrase;

    if (!encodedPrivateKey) {
      throw new Error('Snowflake private key is required in config (Base64 encoded)');
    }

    if (!encodedPassphrase) {
      throw new Error('Snowflake passphrase is required in config (Base64 encoded)');
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
      warehouse: this.config.warehouse,
      database: this.config.database,
      authenticator: this.config.authenticator,
      privateKey: this.config.privateKey,
    });
  }

  /**
   * Establishes connection to Snowflake
   * Returns existing connection if already connected
   */
  connect(): Promise<Connection> {
    if (this.isConnected) {
      return Promise.resolve(this.connection);
    }

    return new Promise((resolve, reject) => {
      this.connection.connect((err: Error | undefined, conn: Connection) => {
        if (err) {
          reject(new Error(`Failed to connect to Snowflake: ${err.message}`));
        } else {
          this.isConnected = true;
          resolve(conn);
        }
      });
    });
  }

  /**
   * Executes a SQL query on Snowflake
   * Validates connection state before executing
   */
  execute<T = any>(sqlText: string, binds?: any[]): Promise<T[]> {
    if (!this.isConnected) {
      throw new Error('Snowflake connection is not established. Call connect() first.');
    }

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText,
        binds,
        complete: (err: Error | undefined, stmt: RowStatement, rows: T[] | undefined) => {
          if (err) {
            reject(new Error(`Query execution failed: ${err.message}\nSQL: ${sqlText}`));
          } else {
            resolve(rows || []);
          }
        },
      });
    });
  }

  /**
   * Executes a SQL query with prepared statement parameters on Snowflake
   * Uses Snowflake's built-in parameter binding for better security and performance
   * Validates connection state before executing
   */
  executeWithParams<T = any>(sqlText: string, params: SnowflakeParamValue[]): Promise<T[]> {
    if (!this.isConnected) {
      throw new Error('Snowflake connection is not established. Call connect() first.');
    }

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText,
        binds: params as any[], // Type assertion needed due to SDK type limitations
        complete: (err: Error | undefined, stmt: RowStatement, rows: T[] | undefined) => {
          if (err) {
            reject(
              new Error(
                `Query execution with params failed: ${err.message}\nSQL: ${sqlText}\nParams: ${JSON.stringify(params)}`
              )
            );
          } else {
            resolve(rows || []);
          }
        },
      });
    });
  }

  /**
   * Closes the Snowflake connection
   * Only destroys if currently connected
   */
  destroy(): Promise<void> {
    if (!this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.connection.destroy((err?: Error) => {
        if (err) {
          reject(new Error(`Failed to destroy connection: ${err.message}`));
        } else {
          this.isConnected = false;
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

  /**
   * Checks if the connection is currently established
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }
}
