import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

export interface ZephyrConfig {
  accessKey: string;
  secretKey: string;
  accountId: string;
  baseURL: string;
}

export class ZephyrClient {
  private config: ZephyrConfig;

  constructor(config?: ZephyrConfig) {
    if (config) {
      this.config = config;
    } else {
      // Load from .env file in local development
      if (!process.env.CI) {
        const configPath = path.resolve(process.cwd(), './config/zephyr.env');
        try {
          dotenv.config({ path: configPath });
        } catch (error) {
          console.warn(
            'Could not load Zephyr config file. If running locally, please ensure config/zephyr.env exists.'
          );
        }
      }

      // Get config from environment variables
      this.config = {
        accessKey: process.env.ZEPHYR_ACCESS_KEY || '',
        secretKey: process.env.ZEPHYR_SECRET_KEY || '',
        accountId: process.env.ZEPHYR_ACCOUNT_ID || '',
        baseURL: process.env.ZEPHYR_BASE_URL || 'https://prod-api.zephyr4jiracloud.com/connect',
      };

      // Validate required configuration
      const missingVars = Object.entries(this.config)
        .filter(([key, value]) => !value && key !== 'baseURL') // baseURL has a default
        .map(([key]) => `ZEPHYR_${key.toUpperCase()}`);

      if (missingVars.length > 0) {
        throw new Error(
          `Missing required Zephyr configuration: ${missingVars.join(', ')}. ` +
            `${process.env.CI ? 'Ensure these are set in your CI environment.' : 'Create a config/zephyr.env file with these variables.'}`
        );
      }
    }
  }

  /**
   * Makes a GET request to Zephyr API
   */
  async get<T>(path: string, queryParams?: string): Promise<T> {
    return this.request('GET', path, queryParams);
  }

  /**
   * Makes a POST request to Zephyr API
   */
  async post<T>(path: string, body: Record<string, unknown>, queryParams?: string): Promise<T> {
    return this.request('POST', path, queryParams, body);
  }

  /**
   * Makes a PUT request to Zephyr API
   */
  async put<T>(path: string, body: Record<string, unknown>, queryParams?: string): Promise<T> {
    return this.request('PUT', path, queryParams, body);
  }

  /**
   * Makes a DELETE request to Zephyr API
   */
  async delete<T>(path: string, queryParams?: string): Promise<T> {
    return this.request('DELETE', path, queryParams);
  }

  private async request<T>(
    method: string,
    path: string,
    queryParams?: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    // Generate JWT token
    const jwt = this.generateJwt(method, path, queryParams, body);

    // Build URL
    const url = new URL(path, this.config.baseURL);
    if (queryParams) {
      url.search = queryParams.startsWith('?') ? queryParams : `?${queryParams}`;
    }

    // Make request
    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `JWT ${jwt}`,
        'Content-Type': 'application/json',
        zapiAccessKey: this.config.accessKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private generateJwt(
    method: string,
    path: string,
    queryParams?: string,
    body?: Record<string, unknown>
  ): string {
    // Create canonical request
    const canonicalParts = [method, path, queryParams || ''];
    if ((method === 'POST' || method === 'PUT') && body) {
      canonicalParts.push(JSON.stringify(body, Object.keys(body).sort()));
    }
    const canonicalRequest = canonicalParts.join('&');

    // Generate QSH
    const qsh = crypto.createHash('sha256').update(canonicalRequest).digest('hex');

    // Create and sign JWT
    const payload = {
      sub: this.config.accountId,
      qsh: qsh,
      iss: this.config.accessKey,
      exp: Math.floor(Date.now() / 1000) + 360, // 6 minutes
    };

    return jwt.sign(payload, this.config.secretKey, { algorithm: 'HS256' });
  }
}
