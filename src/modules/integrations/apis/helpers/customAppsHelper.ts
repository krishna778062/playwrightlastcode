import { faker } from '@faker-js/faker';
import { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { HttpClient } from '@core/api/clients/httpClient';
import { ApiError } from '@core/api/errors/apiError';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { log } from '@core/utils/logger';

import { CustomIntegrationsService } from '../services/CustomAppsService';
import {
  AuthDetails,
  CustomConnectorCreatePayload,
  CustomConnectorResponse,
  CustomConnectorUpdatePayload,
} from '../services/CustomAppsService';

export class CustomIntegrationsHelper {
  public customIntegrationsService: CustomIntegrationsService;
  public createdConnectors: string[] = [];
  private baseUrl: string;
  private httpClient: HttpClient;
  private readonly TEST_DATA_IMAGE_FILES_PATH = path.join(__dirname, '../../test-data/static-files/imageFiles');

  constructor(
    readonly apiRequestContext: APIRequestContext,
    baseUrl: string
  ) {
    this.baseUrl = baseUrl;
    this.customIntegrationsService = new CustomIntegrationsService(apiRequestContext, baseUrl);
    this.httpClient = new HttpClient(apiRequestContext, baseUrl);
  }

  /**
   * Builds a valid custom connector creation payload
   * @param overrides - Optional overrides for connector creation
   * @returns The connector creation payload
   */
  buildValidConnectorPayload(overrides: Partial<CustomConnectorCreatePayload> = {}): CustomConnectorCreatePayload {
    return {
      name: `Test Connector ${faker.string.alphanumeric({ length: 6 })}`,
      description: 'Test connector created via API',
      category: 'other',
      connectionType: 'app',
      authType: 'api-token',
      authDetails: {
        apiTokenLabel: 'API Token',
        authorizationHeader: 'Bearer test-token-12345',
        baseUrl: 'https://api.example.com',
      },
      ...overrides,
    };
  }

  /**
   * Builds an invalid connector payload for negative testing
   * @param overrides - Fields to override to make payload invalid
   * @returns The invalid connector payload
   */
  buildInvalidConnectorPayload(
    overrides: Partial<CustomConnectorCreatePayload> = {}
  ): Partial<CustomConnectorCreatePayload> {
    return {
      name: '',
      description: 'Test connector',
      ...overrides,
    };
  }

  /**
   * Executes an API call and returns error response instead of throwing
   * Used for negative testing scenarios
   */
  private async attemptApiCall(apiCall: () => Promise<any>): Promise<any> {
    try {
      return await apiCall();
    } catch (error: any) {
      return this.extractErrorResponse(error);
    }
  }

  /**
   * Attempts to create a connector with invalid payload
   * Returns error response instead of throwing for negative testing
   */
  async attemptInvalidCreation(invalidPayload: Partial<CustomConnectorCreatePayload>): Promise<any> {
    return this.attemptApiCall(() => this.createCustomIntegration(invalidPayload as CustomConnectorCreatePayload));
  }

  /**
   * Attempts to create a duplicate connector
   * Returns error response instead of throwing for negative testing
   */
  async attemptDuplicateCreation(name: string): Promise<any> {
    return this.attemptApiCall(() => {
      const payload = this.buildValidConnectorPayload({ name });
      return this.createCustomIntegration(payload);
    });
  }

  /**
   * Builds a connector payload with basic auth
   * @param name - Connector name
   * @returns The connector payload with basic auth
   */
  buildBasicAuthConnectorPayload(name: string): CustomConnectorCreatePayload {
    return {
      name,
      description: 'Test connector with basic auth',
      category: 'other',
      connectionType: 'app',
      authType: 'basic',
      authDetails: {
        usernameLabel: 'Username',
        passwordLabel: 'Password',
        baseUrl: 'https://api.example.com',
      },
    };
  }

  /**
   * Builds OAuth auth details with common defaults
   * @param subAuthType - OAuth sub-auth type
   * @param codeChallengeMethod - Code challenge method (empty string for regular OAuth)
   * @param overrides - Optional overrides
   * @returns Auth details object
   */
  private buildOAuthAuthDetails(
    subAuthType: string,
    codeChallengeMethod: string,
    overrides: Partial<AuthDetails> = {}
  ): AuthDetails {
    const cleanOverrides = Object.fromEntries(
      Object.entries(overrides).filter(([_, value]) => value !== undefined)
    ) as Partial<AuthDetails>;

    const authDetails: AuthDetails = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      authUrl: 'https://auth.example.com/authorize',
      tokenUrl: 'https://auth.example.com/token',
      baseUrl: 'https://api.example.com',
      subAuthType,
      codeChallengeMethod,
      tokenRequestHeadersProvided: false,
      ...cleanOverrides,
    };

    // Ensure required fields are always set
    if (!authDetails.subAuthType) {
      authDetails.subAuthType = subAuthType;
    }
    if (authDetails.codeChallengeMethod === undefined || authDetails.codeChallengeMethod === '') {
      authDetails.codeChallengeMethod = codeChallengeMethod;
    }

    // If tokenRequestHeadersProvided is true, include tokenRequestHeaders
    if (authDetails.tokenRequestHeadersProvided === true && !authDetails.tokenRequestHeaders) {
      authDetails.tokenRequestHeaders = 'Content-Type: application/x-www-form-urlencoded';
    }

    return authDetails;
  }

  /**
   * Builds a connector payload with OAuth auth type
   * @param name - Connector name
   * @param overrides - Optional overrides for OAuth details
   * @returns The connector payload with OAuth auth
   */
  buildOAuthConnectorPayload(name: string, overrides: Partial<AuthDetails> = {}): CustomConnectorCreatePayload {
    return {
      name,
      description: 'Test connector with OAuth auth',
      category: 'other',
      connectionType: 'app',
      authType: 'oauth',
      authDetails: this.buildOAuthAuthDetails('Auth Code', '', overrides),
    };
  }

  /**
   * Builds a connector payload with OAuth-PKCE auth type
   * @param name - Connector name
   * @param overrides - Optional overrides for OAuth-PKCE details
   * @returns The connector payload with OAuth-PKCE auth
   */
  buildOAuthPKCEConnectorPayload(name: string, overrides: Partial<AuthDetails> = {}): CustomConnectorCreatePayload {
    return {
      name,
      description: 'Test connector with OAuth-PKCE auth',
      category: 'other',
      connectionType: 'app',
      authType: 'oauth',
      authDetails: this.buildOAuthAuthDetails('Auth Code with PKCE', 'Plain', overrides),
    };
  }

  /**
   * Parses connector ID from response
   * @param response - The API response
   * @returns The connector ID or undefined
   */
  parseConnectorId(response: any): string | undefined {
    const json = response && typeof response.json === 'function' ? response : response;
    return json?.data?.id || json?.result?.id || json?.id;
  }

  /**
   * Validates API response and throws error if invalid
   * @param response - The API response
   * @param json - The parsed JSON response
   * @param operation - The operation name for error messages
   */
  private validateResponse(response: any, json: any, operation: string): void {
    if (!response.ok() || json.error_code || json.errors || (json.status !== 'success' && json.status !== 200)) {
      const errors = json.errors || [];
      const errorMessages = errors.map((err: any) => `${err.error_code}: ${err.message}`).join(', ');
      const errorMessage = json.message || errorMessages || 'Unknown error';
      const errorCode = json.error_code || json.errors?.[0]?.error_code || 'N/A';
      const statusCode = response.status();

      throw new ApiError(
        statusCode,
        `${operation} failed. Error Code: ${errorCode}, Message: ${errorMessage}`,
        response.url(),
        json,
        new Error(`HTTP ${statusCode}: ${errorMessage}`)
      );
    }
  }

  /**
   * Executes a service call, validates the response, and returns parsed JSON
   */
  private async executeAndValidate<T>(serviceCall: () => Promise<any>, operation: string): Promise<T> {
    const response = await serviceCall();
    const json = await response.json();
    this.validateResponse(response, json, operation);
    return json as T;
  }

  /**
   * Creates a custom connector
   * @param payload - The connector creation payload
   * @returns The parsed connector response
   */
  async createCustomIntegration(payload: CustomConnectorCreatePayload): Promise<CustomConnectorResponse> {
    const json = await this.executeAndValidate<CustomConnectorResponse>(
      () => this.customIntegrationsService.createConnector(payload),
      'Custom connector creation'
    );

    const connectorId = this.parseConnectorId(json);
    if (connectorId) {
      this.createdConnectors.push(connectorId);
    }
    return json;
  }

  /**
   * Gets a custom connector by ID
   * @param connectorId - The connector ID
   * @param expand - Optional expand parameters
   * @returns The parsed connector response
   */
  async getCustomIntegrationById(connectorId: string, expand?: string): Promise<CustomConnectorResponse> {
    return this.executeAndValidate<CustomConnectorResponse>(
      () => this.customIntegrationsService.getConnector(connectorId, expand),
      'Failed to get custom connector'
    );
  }

  /**
   * Updates a custom connector
   * @param connectorId - The connector ID
   * @param payload - The update payload
   * @returns The parsed connector response
   */
  async updateCustomIntegration(
    connectorId: string,
    payload: CustomConnectorUpdatePayload
  ): Promise<CustomConnectorResponse> {
    return this.executeAndValidate<CustomConnectorResponse>(
      () => this.customIntegrationsService.updateConnector(connectorId, payload),
      'Custom connector update'
    );
  }

  /**
   * Deletes a custom connector
   * @param connectorId - The connector ID
   * @returns The parsed deletion response
   */
  async deleteCustomIntegration(connectorId: string): Promise<CustomConnectorResponse> {
    const json = await this.executeAndValidate<CustomConnectorResponse>(
      () => this.customIntegrationsService.deleteConnector(connectorId),
      'Custom connector deletion'
    );

    const index = this.createdConnectors.indexOf(connectorId);
    if (index > -1) {
      this.createdConnectors.splice(index, 1);
    }

    return json;
  }

  /**
   * Lists custom connectors
   * @param options - Optional query parameters
   * @returns The parsed list response
   */
  async listCustomIntegrations(
    options: {
      q?: string;
      types?: string;
      sort?: string;
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<any> {
    return this.executeAndValidate(
      () => this.customIntegrationsService.listConnectors(options),
      'Failed to list custom connectors'
    );
  }

  /**
   * Gets connector connections
   * @param connectorId - The connector ID
   * @param type - Optional connection type filter
   * @returns The parsed connections response
   */
  async getConnectorConnections(connectorId: string, type?: string): Promise<any> {
    return this.executeAndValidate(
      () => this.customIntegrationsService.getConnectorConnections(connectorId, type),
      'Failed to get connector connections'
    );
  }

  /**
   * Updates the status (enable/disable) of a custom connector
   * @param connectorId - The connector ID
   * @param enabled - Whether to enable or disable the connector
   * @returns The parsed status update response
   */
  async updateConnectorStatus(connectorId: string, enabled: boolean): Promise<CustomConnectorResponse> {
    return this.executeAndValidate<CustomConnectorResponse>(
      () => this.customIntegrationsService.updateConnectorStatus(connectorId, enabled),
      'Custom connector status update'
    );
  }

  /**
   * Creates a connector and returns its ID
   * Useful for test setup scenarios
   */
  async createAndGetId(overrides: Partial<CustomConnectorCreatePayload> = {}): Promise<string> {
    const payload = this.buildValidConnectorPayload(overrides);
    const response = await this.createCustomIntegration(payload);
    const connectorId = this.parseConnectorId(response);
    if (!connectorId) {
      throw new Error('Failed to get connector ID from creation response');
    }
    return connectorId;
  }

  /**
   * Creates a connector and returns ID, response, and name
   * Useful for test scenarios that need full connector details
   */
  async createAndValidate(overrides: Partial<CustomConnectorCreatePayload> = {}): Promise<{
    connectorId: string;
    response: CustomConnectorResponse;
    connectorName: string;
  }> {
    const payload = this.buildValidConnectorPayload(overrides);
    const response = await this.createCustomIntegration(payload);
    const connectorId = this.parseConnectorId(response);
    if (!connectorId) {
      throw new Error('Failed to get connector ID from creation response');
    }
    const connectorName = this.parseConnectorName(response) || payload.name;
    return { connectorId, response, connectorName };
  }

  /**
   * Parses connector name from response
   * @param response - The API response
   * @returns The connector name or undefined
   */
  parseConnectorName(response: any): string | undefined {
    const json = response && typeof response.json === 'function' ? response : response;
    return json?.data?.name || json?.result?.name || json?.name;
  }

  /**
   * Attempts to create connector without authentication
   * Returns error response instead of throwing for negative testing
   */
  async attemptCreationWithoutAuth(payload: CustomConnectorCreatePayload): Promise<any> {
    return this.attemptApiCall(async () => {
      const response = await this.customIntegrationsService.createConnector(payload);
      const json = await response.json();
      if (!response.ok()) {
        return { ...json, status: response.status() };
      }
      return { status: 200, message: 'Unexpected success without auth' };
    });
  }

  /**
   * Attempts to create connector with invalid authentication
   * Returns error response instead of throwing for negative testing
   */
  async attemptCreationWithInvalidAuth(payload: CustomConnectorCreatePayload, invalidTokenContext: any): Promise<any> {
    return this.attemptApiCall(async () => {
      const service = new CustomIntegrationsService(invalidTokenContext, this.baseUrl);
      const response = await service.createConnector(payload);
      const json = await response.json();
      if (!response.ok()) {
        return { ...json, status: response.status() };
      }
      return { status: 200, message: 'Unexpected success with invalid auth' };
    });
  }

  /**
   * Cleans up all created connectors
   * Handles errors gracefully to ensure cleanup completes
   */
  async cleanup(): Promise<void> {
    const connectorsToDelete = [...this.createdConnectors];
    this.createdConnectors = [];

    for (const connectorId of connectorsToDelete) {
      try {
        await this.deleteCustomIntegration(connectorId);
      } catch (error) {
        log.warn(`Failed to cleanup connector ${connectorId}`, error);
      }
    }
  }

  /**
   * Attempts to create connector with invalid base URL
   * Returns error response instead of throwing for negative testing
   */
  async attemptCreationWithInvalidUrl(): Promise<any> {
    return this.attemptApiCall(() => {
      const invalidPayload = this.buildValidConnectorPayload({
        authDetails: {
          apiTokenLabel: 'API Token',
          authorizationHeader: 'Bearer test-token',
          baseUrl: 'not-a-valid-url',
        },
      });
      return this.createCustomIntegration(invalidPayload);
    });
  }

  /**
   * Attempts to create connector with invalid redirect URI
   * Returns error response instead of throwing for negative testing
   */
  async attemptCreationWithInvalidRedirectUri(): Promise<any> {
    return this.attemptApiCall(() => {
      const invalidPayload = this.buildOAuthConnectorPayload(`Test Connector ${Date.now()}`, {
        redirectUri: 'not-a-valid-url',
      });
      return this.createCustomIntegration(invalidPayload);
    });
  }

  /**
   * Attempts to get connector by invalid ID
   * Returns error response instead of throwing for negative testing
   */
  async attemptGetWithInvalidId(connectorId: string): Promise<any> {
    return this.attemptApiCall(() => this.getCustomIntegrationById(connectorId));
  }

  /**
   * Attempts to update connector with invalid ID
   * Returns error response instead of throwing for negative testing
   */
  async attemptUpdateWithInvalidId(connectorId: string, payload: CustomConnectorUpdatePayload): Promise<any> {
    return this.attemptApiCall(() => this.updateCustomIntegration(connectorId, payload));
  }

  /**
   * Attempts to delete connector with invalid ID
   * Returns error response instead of throwing for negative testing
   */
  async attemptDeleteWithInvalidId(connectorId: string): Promise<any> {
    return this.attemptApiCall(() => this.deleteCustomIntegration(connectorId));
  }

  /**
   * Attempts to delete connector twice
   * Returns error response instead of throwing for negative testing
   */
  async attemptDeleteTwice(connectorId: string): Promise<any> {
    return this.attemptApiCall(async () => {
      await this.deleteCustomIntegration(connectorId);
      const index = this.createdConnectors.indexOf(connectorId);
      if (index > -1) {
        this.createdConnectors.splice(index, 1);
      }
      return await this.deleteCustomIntegration(connectorId);
    });
  }

  /**
   * Gets a signed URL for logo file upload
   * @param fileName - The name of the file to upload
   * @param fileSize - The size of the file in bytes
   * @param mimeType - The MIME type of the file (e.g., 'image/jpeg', 'image/png')
   * @returns Object with uploadUrl and fileId
   */
  async getSignedUploadUrlForLogo(
    fileName: string,
    fileSize: number,
    mimeType: string
  ): Promise<{
    uploadUrl: string;
    fileId: string;
  }> {
    const payload = {
      file_name: fileName,
      size: fileSize,
      mime_type: mimeType,
    };

    const response = await this.httpClient.post(API_ENDPOINTS.content.signedUrl, {
      data: payload,
    });

    const json = await response.json();

    if (!response.ok() || json.status !== 'success' || !json.result?.upload_url || !json.result?.file_id) {
      throw new Error(`Failed to get signed upload URL for logo. Response: ${JSON.stringify(json)}`);
    }

    return {
      uploadUrl: json.result.upload_url,
      fileId: json.result.file_id,
    };
  }

  /**
   * Uploads logo file to signed URL
   * @param uploadUrl - The signed upload URL
   * @param filePath - The local path to the file
   * @param fileName - The name of the file
   * @param mimeType - The MIME type of the file
   */
  async uploadLogoToSignedUrl(uploadUrl: string, filePath: string, fileName: string, mimeType: string): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Logo file not found at path: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const headers = {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename=${fileName}`,
    };

    const response = await this.apiRequestContext.put(uploadUrl, {
      headers,
      data: fileBuffer,
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Logo upload to signed URL failed. Status: ${response.status()}, Error: ${errorText}`);
    }
  }

  /**
   * Uploads logo file and returns fileId
   * @param fileName - The name of the file from test-data/static-files/imageFiles directory
   * @returns The fileId of the uploaded logo
   */
  async uploadLogoAndGetFileId(fileName: string): Promise<string> {
    const filePath = path.join(this.TEST_DATA_IMAGE_FILES_PATH, fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Logo file not found: ${filePath}`);
    }

    const fileSize = fs.statSync(filePath).size;
    const fileExtension = path.extname(fileName).toLowerCase();
    const mimeType = fileExtension === '.png' ? 'image/png' : 'image/jpeg';

    const { uploadUrl, fileId } = await this.getSignedUploadUrlForLogo(fileName, fileSize, mimeType);
    await this.uploadLogoToSignedUrl(uploadUrl, filePath, fileName, mimeType);

    return fileId;
  }

  /**
   * Creates a connector with logo upload
   * @param payload - The connector creation payload
   * @param logoFileName - Optional logo file name from test-data directory
   * @returns The parsed connector response
   */
  async createCustomIntegrationWithLogo(
    payload: CustomConnectorCreatePayload,
    logoFileName?: string
  ): Promise<CustomConnectorResponse> {
    if (logoFileName) {
      const logoFileId = await this.uploadLogoAndGetFileId(logoFileName);
      payload.logoFileId = logoFileId;
    }

    return this.createCustomIntegration(payload);
  }

  /**
   * Updates a connector with new logo
   * @param connectorId - The connector ID
   * @param payload - The update payload
   * @param logoFileName - Optional logo file name from test-data directory
   * @returns The parsed connector response
   */
  async updateCustomIntegrationWithLogo(
    connectorId: string,
    payload: CustomConnectorUpdatePayload,
    logoFileName?: string
  ): Promise<CustomConnectorResponse> {
    if (logoFileName) {
      const logoFileId = await this.uploadLogoAndGetFileId(logoFileName);
      payload.logoFileId = logoFileId;
    }

    return this.updateCustomIntegration(connectorId, payload);
  }

  /**
   * Attempts to upload logo with invalid file (for negative testing)
   * Returns error response instead of throwing
   * @param fileName - The invalid logo file name
   * @returns Error response object with status and error details
   */
  async attemptLogoUploadWithInvalidFile(fileName: string): Promise<any> {
    try {
      return await this.uploadLogoAndGetFileId(fileName);
    } catch (error: any) {
      return this.extractErrorResponse(error);
    }
  }

  /**
   * Extracts error response from error object or API response
   */
  private extractErrorResponse(error: any): any {
    if (error instanceof ApiError) {
      return {
        status: error.statusCode,
        error_code: error.response?.error_code || 'N/A',
        errors: error.response?.errors || [],
        message: error.message,
        ...error.response,
      };
    }

    if (error.response) {
      const response = error.response && typeof error.response.json === 'function' ? error.response : error.response;
      return response;
    }

    // Extract from error message if it contains HTTP status info
    if (error?.message?.includes('HTTP')) {
      const statusMatch = error.message.match(/HTTP(?: Status)?:?\s*(\d+)/);
      const errorCodeMatch = error.message.match(/Error Code:\s*([^,]+)/);
      return {
        status: statusMatch ? parseInt(statusMatch[1]) : 400,
        error_code: errorCodeMatch?.[1]?.trim(),
        errors: error.errors || [],
        message: error.message,
      };
    }

    return {
      status: error.statusCode || error.status || 400,
      error_code: error.error_code || 'N/A',
      errors: error.errors || [],
      message: error.message || 'Unknown error',
    };
  }
}
