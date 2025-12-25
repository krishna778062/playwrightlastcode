import { APIRequestContext, test } from '@playwright/test';

import { HttpClient } from '@core/api/clients/httpClient';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';

import { getTenantConfig } from '../../config/integration.config';

export interface AuthDetails {
  apiTokenLabel?: string;
  authorizationHeader?: string;
  baseUrl?: string;
  usernameLabel?: string;
  passwordLabel?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
  subAuthType?: string;
  authUrl?: string;
  tokenUrl?: string;
  codeChallengeMethod?: string;
  clientIdLabel?: string;
  secretKeyLabel?: string;
  tokenRequestHeadersProvided?: boolean;
  [key: string]: any;
}

export interface CustomConnectorCreatePayload {
  name: string;
  description?: string;
  category?:
    | 'files'
    | 'messaging'
    | 'calendar'
    | 'campaigns'
    | 'support'
    | 'people'
    | 'learning'
    | 'crm'
    | 'task'
    | 'other';
  connectionType?: 'app' | 'user';
  authType?: 'oauth' | 'basic' | 'api-token' | 'oauth-pkce';
  authDetails?: AuthDetails;
  [key: string]: any;
}

export interface CustomConnectorUpdatePayload extends Partial<CustomConnectorCreatePayload> {
  name?: string;
  description?: string;
  enabled?: boolean;
}

export interface CustomConnectorResponse {
  status: string | number;
  message?: string;
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  connectionType?: string;
  authType?: string;
  enabled?: boolean;
  createdAt?: string;
  modifiedAt?: string;
  data?: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    connectionType?: string;
    authType?: string;
    enabled?: boolean;
    createdAt?: string;
    modifiedAt?: string;
    [key: string]: any;
  };
  result?: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    connectionType?: string;
    authType?: string;
    enabled?: boolean;
    createdAt?: string;
    modifiedAt?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CustomConnectorListResponse {
  status: string | number;
  message?: string;
  total_count?: string | number;
  page?: number;
  limit?: number;
  responseTimeStamp?: number;
  listOfItems?: Array<{
    id?: string;
    connector_id?: string;
    name?: string;
    connector_name?: string;
    description?: string;
    category?: string;
    enabled?: boolean;
    is_enabled?: boolean;
    [key: string]: any;
  }>;
  totalCount?: number;
  data?: {
    listOfItems?: Array<{
      id?: string;
      connector_id?: string;
      name?: string;
      connector_name?: string;
      description?: string;
      category?: string;
      enabled?: boolean;
      is_enabled?: boolean;
      [key: string]: any;
    }>;
    totalCount?: number;
    [key: string]: any;
  };
  result?:
    | Array<{
        id?: string;
        connector_id?: string;
        name?: string;
        connector_name?: string;
        description?: string;
        category?: string;
        enabled?: boolean;
        is_enabled?: boolean;
        [key: string]: any;
      }>
    | {
        listOfItems?: Array<{
          id?: string;
          connector_id?: string;
          name?: string;
          connector_name?: string;
          description?: string;
          category?: string;
          enabled?: boolean;
          is_enabled?: boolean;
          [key: string]: any;
        }>;
        totalCount?: number;
        [key: string]: any;
      };
  [key: string]: any;
}

export class CustomIntegrationsService {
  public httpClient: HttpClient;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(apiRequestContext, baseUrl);
  }

  /**
   * Creates a new custom connector
   * @param payload - The connector creation payload
   * @returns The API response
   */
  async createConnector(payload: CustomConnectorCreatePayload) {
    return test.step(`Creating custom connector: ${payload.name}`, async () => {
      return this.httpClient.post(API_ENDPOINTS.integrations.connectors.create, {
        data: payload,
      });
    });
  }

  /**
   * Gets a custom connector by ID
   * @param connectorId - The connector ID
   * @param expand - Optional expand parameters (e.g., 'authDetails,nextStepsDetails')
   * @returns The API response
   */
  async getConnector(connectorId: string, expand?: string) {
    return test.step(`Getting custom connector: ${connectorId}`, async () => {
      const endpoint = API_ENDPOINTS.integrations.connectors.get(connectorId);
      if (expand) {
        const queryParams = new URLSearchParams({ expand });
        return this.httpClient.get(`${endpoint}?${queryParams.toString()}`);
      }
      return this.httpClient.get(endpoint);
    });
  }

  /**
   * Gets connections for a custom connector
   * @param connectorId - The connector ID
   * @param type - Optional connection type filter (e.g., 'app', 'user')
   * @returns The API response
   */
  async getConnectorConnections(connectorId: string, type?: string) {
    return test.step(`Getting connections for connector: ${connectorId}`, async () => {
      const endpoint = API_ENDPOINTS.integrations.connectors.getConnections(connectorId, type);
      return this.httpClient.get(endpoint);
    });
  }

  /**
   * Updates a custom connector
   * @param connectorId - The connector ID
   * @param payload - The connector update payload
   * @returns The API response
   */
  async updateConnector(connectorId: string, payload: CustomConnectorUpdatePayload) {
    return test.step(`Updating custom connector: ${connectorId}`, async () => {
      return this.httpClient.patch(API_ENDPOINTS.integrations.connectors.update(connectorId), {
        data: payload,
      });
    });
  }

  /**
   * Deletes a custom connector
   * @param connectorId - The connector ID
   * @returns The API response
   */
  async deleteConnector(connectorId: string) {
    return test.step(`Deleting custom connector: ${connectorId}`, async () => {
      return this.httpClient.delete(API_ENDPOINTS.integrations.connectors.delete(connectorId));
    });
  }

  /**
   * Lists all custom connectors
   * @param options - Optional query parameters
   * @returns The API response
   */
  async listConnectors(
    options: {
      q?: string;
      types?: string;
      sort?: string;
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ) {
    return test.step('Listing custom connectors', async () => {
      const queryParams = new URLSearchParams();

      if (options.q) queryParams.set('q', options.q);
      if (options.sort) queryParams.set('sort', options.sort);
      if (options.order) queryParams.set('order', options.order);
      if (options.page) queryParams.set('page', options.page.toString());
      if (options.limit) queryParams.set('limit', options.limit.toString());

      queryParams.set('types', options.types || 'custom,hybrid');

      const endpoint = `${API_ENDPOINTS.integrations.connectors.list}?${queryParams.toString()}`;
      return this.httpClient.get(endpoint);
    });
  }

  /**
   * Updates the status (enable/disable) of a custom connector
   * @param connectorId - The connector ID
   * @param enabled - Whether to enable or disable the connector
   * @returns The API response
   */
  async updateConnectorStatus(connectorId: string, enabled: boolean) {
    return test.step(`${enabled ? 'Enabling' : 'Disabling'} custom connector: ${connectorId}`, async () => {
      const tenantConfig = getTenantConfig();
      const roleId = tenantConfig.TENANT_USER_ROLE_ID;

      const requestOptions: {
        data: { enabled: boolean };
        headers?: { 'x-smtip-tenant-user-role': string };
      } = {
        data: { enabled },
      };

      if (roleId) {
        requestOptions.headers = {
          'x-smtip-tenant-user-role': roleId.toString(),
        };
      }

      return this.httpClient.patch(API_ENDPOINTS.integrations.connectors.update(connectorId), requestOptions);
    });
  }
}
