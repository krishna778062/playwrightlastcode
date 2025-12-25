import { expect, test } from '@playwright/test';

import {
  CustomConnectorListResponse,
  CustomConnectorResponse,
} from '@/src/modules/integrations/apis/services/CustomAppsService';

export class ApiResponseAssertions {
  /**
   * Asserts successful API response (200)
   */
  static expectSuccess(response: any): void {
    const status = response.status;
    expect(status === 'success' || status === 200, `Expected success but got: ${status}`).toBeTruthy();
  }

  /**
   * Asserts unauthorized error response (401)
   */
  static expectUnauthorized(response: any): void {
    const hasError =
      response.error_code ||
      response.errors ||
      response.status === 401 ||
      (typeof response.status === 'number' && response.status === 401);
    expect(hasError, `Expected unauthorized error (401) but got: ${JSON.stringify(response)}`).toBeTruthy();
  }

  /**
   * Asserts forbidden error response (403)
   */
  static expectForbidden(response: any): void {
    const hasError = response.error_code || response.errors || response.status === 403;
    expect(hasError, 'Expected forbidden error (403)').toBeTruthy();
  }

  /**
   * Asserts validation error response (400)
   */
  static expectValidationError(response: any, expectedErrorCode?: string): void {
    expect(response.error_code || response.errors, 'Expected validation error (400)').toBeTruthy();
    if (expectedErrorCode) {
      const errorCode = response.error_code || response.errors?.[0]?.error_code;
      expect(errorCode, `Expected error code ${expectedErrorCode}`).toBe(expectedErrorCode);
    }
  }

  /**
   * Asserts conflict error response (409)
   */
  static expectConflict(response: any): void {
    const hasError = response.error_code || response.errors || response.status === 409;
    expect(hasError, 'Expected conflict error (409)').toBeTruthy();
  }

  /**
   * Asserts not found error response (404)
   */
  static expectNotFound(response: any): void {
    const hasError = response.error_code || response.errors || response.status === 404;
    expect(hasError, 'Expected not found error (404)').toBeTruthy();
  }

  /**
   * Asserts connector ID exists and is valid
   */
  static expectValidConnectorId(connectorId: string | undefined): void {
    expect(connectorId, 'Connector ID should exist').toBeTruthy();
    expect(typeof connectorId, 'Connector ID should be a string').toBe('string');
  }

  /**
   * Asserts error response with specific status code
   */
  static expectErrorStatus(response: any, statusCode: number): void {
    const status = typeof response.status === 'number' ? response.status : statusCode;
    expect(
      status === statusCode || response.error_code || response.errors,
      `Expected error status ${statusCode}`
    ).toBeTruthy();
  }
}

export class CustomIntegrationsApiHelper {
  /**
   * Gets connector data from data, result, or root level
   * @param connectorResponse - The connector response
   * @returns The connector data object
   */
  private getConnectorData(connectorResponse: CustomConnectorResponse): any {
    return connectorResponse.data || connectorResponse.result || connectorResponse;
  }

  /**
   * Gets list items array from data, result, or root level
   * @param listResponse - The list response
   * @returns The array of connector items
   */
  getListItems(listResponse: CustomConnectorListResponse): any[] {
    if (Array.isArray(listResponse.result)) {
      return listResponse.result;
    }
    if (listResponse.result && typeof listResponse.result === 'object' && 'listOfItems' in listResponse.result) {
      return listResponse.result.listOfItems || [];
    }
    return listResponse.data?.listOfItems || listResponse.listOfItems || [];
  }

  /**
   * Validates response status is success
   * @param response - The response to validate
   */
  private validateSuccessStatus(response: any): void {
    const status = response.status;
    expect(status === 'success' || status === 200, `Status should be 'success' or 200, but got ${status}`).toBeTruthy();
  }

  /**
   * Validates the basic connector response structure (status)
   * @param connectorResponse - The connector response to validate
   */
  async validateConnectorResponseBasic(connectorResponse: CustomConnectorResponse): Promise<void> {
    await test.step('Validate connector response basic fields', async () => {
      this.validateSuccessStatus(connectorResponse);
      const hasConnectorData =
        connectorResponse.data !== undefined ||
        connectorResponse.result !== undefined ||
        connectorResponse.id !== undefined ||
        connectorResponse.name !== undefined;
      if (hasConnectorData) {
        expect(
          hasConnectorData,
          'If connector data exists, it should be in data, result, or at root level'
        ).toBeTruthy();
      }
    });
  }

  /**
   * Validates connector identification fields (id, name)
   * @param connectorResponse - The connector response to validate
   * @param expectedName - Optional expected name text
   */
  async validateConnectorIdentification(
    connectorResponse: CustomConnectorResponse,
    expectedName?: string
  ): Promise<void> {
    await test.step('Validate connector identification fields', async () => {
      const connector = this.getConnectorData(connectorResponse);
      if (connector && (connector.id || connector.name)) {
        if (connector.id) {
          expect(connector.id, 'Connector ID should be present').toBeTruthy();
          expect(typeof connector.id, 'Connector ID should be a string').toBe('string');
        }
        if (connector.name) {
          expect(connector.name, 'Connector name should be present').toBeTruthy();
          expect(typeof connector.name, 'Connector name should be a string').toBe('string');
          if (expectedName) {
            expect(connector.name, 'Connector name should match expected text').toContain(expectedName);
          }
        }
      }
    });
  }

  /**
   * Validates connector metadata (description, category, authType, etc.)
   * @param connectorResponse - The connector response to validate
   */
  async validateConnectorMetadata(connectorResponse: CustomConnectorResponse): Promise<void> {
    await test.step('Validate connector metadata fields', async () => {
      const connector = this.getConnectorData(connectorResponse);
      expect(connector, 'Connector data should exist').toBeDefined();
      if (connector.description !== undefined) {
        expect(typeof connector.description, 'Description should be a string').toBe('string');
      }
      if (connector.category !== undefined) {
        expect(typeof connector.category, 'Category should be a string').toBe('string');
      }
      if (connector.authType !== undefined) {
        expect(typeof connector.authType, 'Auth type should be a string').toBe('string');
      }
      if (connector.connectionType !== undefined) {
        expect(typeof connector.connectionType, 'Connection type should be a string').toBe('string');
      }
    });
  }

  /**
   * Validates connector creation response
   * @param connectorResponse - The connector creation response to validate
   * @param expectedName - Optional expected name text
   */
  async validateConnectorCreation(connectorResponse: CustomConnectorResponse, expectedName?: string): Promise<void> {
    await test.step('Validate connector creation response', async () => {
      ApiResponseAssertions.expectSuccess(connectorResponse);
      await this.validateConnectorIdentification(connectorResponse, expectedName);
      await this.validateConnectorMetadata(connectorResponse);
    });
  }

  /**
   * Validates connector creation with automatic name extraction
   * @param connectorResponse - The connector creation response to validate
   */
  async validateConnectorCreationAuto(connectorResponse: CustomConnectorResponse): Promise<void> {
    const connector = this.getConnectorData(connectorResponse);
    const connectorName = connector?.name;
    await this.validateConnectorCreation(connectorResponse, connectorName);
  }

  /**
   * Validates connector update response
   * @param connectorResponse - The connector update response to validate
   * @param expectedName - Optional expected name text
   */
  async validateConnectorUpdate(connectorResponse: CustomConnectorResponse, expectedName?: string): Promise<void> {
    await test.step('Validate connector update response', async () => {
      ApiResponseAssertions.expectSuccess(connectorResponse);
      await this.validateConnectorIdentification(connectorResponse, expectedName);
      await this.validateConnectorMetadata(connectorResponse);
    });
  }

  /**
   * Validates connector update with automatic name extraction
   * @param connectorResponse - The connector update response to validate
   */
  async validateConnectorUpdateAuto(connectorResponse: CustomConnectorResponse): Promise<void> {
    const connector = this.getConnectorData(connectorResponse);
    const connectorName = connector?.name;
    await this.validateConnectorUpdate(connectorResponse, connectorName);
  }

  /**
   * Validates connector list response structure
   * @param listResponse - The connector list response to validate
   * @param allowEmpty - Whether to allow empty lists (default: false)
   */
  async validateConnectorList(listResponse: CustomConnectorListResponse, allowEmpty: boolean = false): Promise<void> {
    await test.step('Validate connector list response', async () => {
      this.validateSuccessStatus(listResponse);
      const listItems = this.getListItems(listResponse);
      expect(listItems, 'List of items should exist').toBeDefined();
      expect(Array.isArray(listItems), 'List of items should be an array').toBe(true);
      if (!allowEmpty) {
        expect(listItems.length, 'List should contain at least one item').toBeGreaterThan(0);
      }
    });
  }

  /**
   * Validates that a connector exists in the list
   * @param listResponse - The connector list response
   * @param connectorId - The connector ID to find
   */
  async validateConnectorInList(listResponse: CustomConnectorListResponse, connectorId: string): Promise<void> {
    await test.step(`Validate connector ${connectorId} exists in list`, async () => {
      await this.validateConnectorList(listResponse);
      const listItems = this.getListItems(listResponse);
      const connector = listItems.find(item => item.id === connectorId || item.connector_id === connectorId);
      expect(connector, `Connector ${connectorId} should exist in list`).toBeDefined();
    });
  }

  /**
   * Validates that a connector does not exist in the list
   * @param listResponse - The connector list response
   * @param connectorId - The connector ID to verify absence
   */
  async validateConnectorNotInList(listResponse: CustomConnectorListResponse, connectorId: string): Promise<void> {
    await test.step(`Validate connector ${connectorId} does not exist in list`, async () => {
      await this.validateConnectorList(listResponse);
      const listItems = this.getListItems(listResponse);
      const connector = listItems.find(item => item.id === connectorId || item.connector_id === connectorId);
      expect(connector, `Connector ${connectorId} should not exist in list`).toBeUndefined();
    });
  }

  /**
   * Validates connector deletion response
   * @param connectorResponse - The connector deletion response to validate
   */
  async validateConnectorDeletion(connectorResponse: CustomConnectorResponse): Promise<void> {
    await test.step('Validate connector deletion response', async () => {
      this.validateSuccessStatus(connectorResponse);
    });
  }

  /**
   * Validates connector status update response
   * @param connectorResponse - The connector status update response to validate
   * @param expectedEnabled - Expected enabled status
   */
  async validateConnectorStatusUpdate(
    connectorResponse: CustomConnectorResponse,
    expectedEnabled: boolean
  ): Promise<void> {
    await test.step(`Validate connector status is ${expectedEnabled ? 'enabled' : 'disabled'}`, async () => {
      await this.validateConnectorResponseBasic(connectorResponse);
      if (connectorResponse.result?.enabled !== undefined) {
        expect(connectorResponse.result.enabled, `Connector enabled status should be ${expectedEnabled}`).toBe(
          expectedEnabled
        );
      }
    });
  }
}
