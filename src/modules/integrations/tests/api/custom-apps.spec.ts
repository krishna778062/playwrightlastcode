import { integrationsFixture as test } from '@integrations/fixtures/integrationsFixture';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { request } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import {
  ApiResponseAssertions,
  CustomIntegrationsApiHelper,
} from '@/src/modules/integrations/apis/apiValidation/customAppsApiValidations';
import { CustomIntegrationsHelper } from '@/src/modules/integrations/apis/helpers/customAppsHelper';
import { getTenantConfig } from '@/src/modules/integrations/config/integration.config';

test.describe(
  'Integrations Custom Integrations API',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APPS],
  },
  () => {
    let customIntegrationsApiHelper: CustomIntegrationsApiHelper;

    test.beforeEach(async () => {
      customIntegrationsApiHelper = new CustomIntegrationsApiHelper();
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      try {
        await appManagerApiFixture.customIntegrationsHelper.cleanup();
      } catch (error) {
        console.warn('Connector cleanup failed:', error);
      }
    });

    test(
      'verify app manager can create custom connector via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30167',
        });

        const { connectorId, response } = await appManagerApiFixture.customIntegrationsHelper.createAndValidate();
        await customIntegrationsApiHelper.validateConnectorCreationAuto(response);
        ApiResponseAssertions.expectValidConnectorId(connectorId);
      }
    );

    test(
      'verify app manager can get custom connector by ID via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30168',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        const getResponse = await appManagerApiFixture.customIntegrationsHelper.getCustomIntegrationById(connectorId);
        await customIntegrationsApiHelper.validateConnectorResponseBasic(getResponse);
        ApiResponseAssertions.expectSuccess(getResponse);
      }
    );

    test(
      'verify app manager can update custom connector via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30169',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        const updateResponse = await appManagerApiFixture.customIntegrationsHelper.updateCustomIntegration(
          connectorId,
          {
            name: 'Updated Name',
            description: 'Updated description',
          }
        );
        await customIntegrationsApiHelper.validateConnectorUpdate(updateResponse, 'Updated Name');
        ApiResponseAssertions.expectSuccess(updateResponse);
      }
    );

    test(
      'verify app manager can list custom connectors via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30170',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        const listResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 100,
        });
        await customIntegrationsApiHelper.validateConnectorList(listResponse);
        await customIntegrationsApiHelper.validateConnectorInList(listResponse, connectorId);
      }
    );

    test(
      'verify app manager can delete custom connector via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30171',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        const index = appManagerApiFixture.customIntegrationsHelper.createdConnectors.indexOf(connectorId);
        if (index > -1) {
          appManagerApiFixture.customIntegrationsHelper.createdConnectors.splice(index, 1);
        }

        const deleteResponse = await appManagerApiFixture.customIntegrationsHelper.deleteCustomIntegration(connectorId);
        await customIntegrationsApiHelper.validateConnectorDeletion(deleteResponse);
        ApiResponseAssertions.expectSuccess(deleteResponse);

        const listResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 100,
        });
        await customIntegrationsApiHelper.validateConnectorNotInList(listResponse, connectorId);
      }
    );

    test(
      'verify app manager can enable custom connector via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30172',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        const enableResponse = await appManagerApiFixture.customIntegrationsHelper.updateConnectorStatus(
          connectorId,
          true
        );
        await customIntegrationsApiHelper.validateConnectorStatusUpdate(enableResponse, true);
        ApiResponseAssertions.expectSuccess(enableResponse);
      }
    );

    test(
      'verify app manager can disable custom connector via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30173',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        const disableResponse = await appManagerApiFixture.customIntegrationsHelper.updateConnectorStatus(
          connectorId,
          false
        );
        await customIntegrationsApiHelper.validateConnectorStatusUpdate(disableResponse, false);
        ApiResponseAssertions.expectSuccess(disableResponse);
      }
    );

    test(
      'verify app manager can get custom connector with expand parameters',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30173',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const expandOptions = ['authDetails', 'nextStepsDetails', 'authDetails,nextStepsDetails'];

        for (const expand of expandOptions) {
          const getResponse = await appManagerApiFixture.customIntegrationsHelper.getCustomIntegrationById(
            connectorId,
            expand
          );
          await customIntegrationsApiHelper.validateConnectorResponseBasic(getResponse);
          ApiResponseAssertions.expectSuccess(getResponse);
        }
      }
    );

    test(
      'verify app manager can get custom connector connections',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30174',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const connectionsResponse = await appManagerApiFixture.customIntegrationsHelper.getConnectorConnections(
          connectorId,
          'app'
        );
        ApiResponseAssertions.expectSuccess(connectionsResponse);
      }
    );

    test(
      'verify app manager can list custom connectors with pagination via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30175',
        });

        const page1Response = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 10,
        });

        await customIntegrationsApiHelper.validateConnectorList(page1Response);

        const page2Response = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 2,
          limit: 10,
        });

        await customIntegrationsApiHelper.validateConnectorList(page2Response);
      }
    );

    test(
      'verify app manager can list custom connectors with different sort options via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30177',
        });

        const sortOptions: Array<{ sort: string; order: 'asc' | 'desc' }> = [
          { sort: 'name', order: 'asc' },
          { sort: 'name', order: 'desc' },
          { sort: 'lastmodified', order: 'asc' },
          { sort: 'lastmodified', order: 'desc' },
          { sort: 'datecreated', order: 'asc' },
          { sort: 'datecreated', order: 'desc' },
          { sort: 'lastused', order: 'asc' },
          { sort: 'lastused', order: 'desc' },
        ];

        for (const sortOption of sortOptions) {
          const response = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
            types: 'custom,hybrid',
            ...sortOption,
            page: 1,
            limit: 50,
          });
          await customIntegrationsApiHelper.validateConnectorList(response);
        }
      }
    );

    test(
      'verify app manager can search custom connectors by name via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30178',
        });

        const { connectorId, connectorName } = await appManagerApiFixture.customIntegrationsHelper.createAndValidate();

        await new Promise(resolve => setTimeout(resolve, 1000));
        const searchResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          q: connectorName,
          types: 'custom,hybrid',
          limit: 100,
        });

        await customIntegrationsApiHelper.validateConnectorList(searchResponse);
        await customIntegrationsApiHelper.validateConnectorInList(searchResponse, connectorId);
      }
    );

    test(
      'verify app manager can list prebuilt connectors via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30179',
        });

        const prebuiltResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 50,
        });

        await customIntegrationsApiHelper.validateConnectorList(prebuiltResponse);
      }
    );

    test(
      'verify app manager can list only custom connectors via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30180',
        });

        const customOnlyResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 50,
        });

        await customIntegrationsApiHelper.validateConnectorList(customOnlyResponse);
      }
    );

    test(
      'verify app manager can get connector connections with user type via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30181',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const connectionsResponse = await appManagerApiFixture.customIntegrationsHelper.getConnectorConnections(
          connectorId,
          'user'
        );
        ApiResponseAssertions.expectSuccess(connectionsResponse);
      }
    );

    test(
      'verify app manager can update connector category via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30182',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const updateResponse = await appManagerApiFixture.customIntegrationsHelper.updateCustomIntegration(
          connectorId,
          {
            category: 'files',
          }
        );

        await customIntegrationsApiHelper.validateConnectorUpdate(updateResponse);
      }
    );

    test(
      'verify app manager can create connector with different auth types via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30183',
        });

        const payload = appManagerApiFixture.customIntegrationsHelper.buildBasicAuthConnectorPayload(
          `Test Connector ${Date.now()}`
        );
        const connectorResponse = await appManagerApiFixture.customIntegrationsHelper.createCustomIntegration(payload);
        await customIntegrationsApiHelper.validateConnectorCreation(connectorResponse);
      }
    );

    test(
      'verify app manager can create connector with different categories via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30184',
        });

        const categories = [
          'files',
          'messaging',
          'calendar',
          'campaigns',
          'support',
          'people',
          'learning',
          'crm',
          'task',
          'other',
        ];

        for (const category of categories) {
          const { response: connectorResponse } = await appManagerApiFixture.customIntegrationsHelper.createAndValidate(
            {
              category: category as any,
            }
          );
          await customIntegrationsApiHelper.validateConnectorCreationAuto(connectorResponse);
        }
      }
    );

    test(
      'verify app manager can create connector with user connection type via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30185',
        });

        const { response: connectorResponse } = await appManagerApiFixture.customIntegrationsHelper.createAndValidate({
          connectionType: 'user',
        });
        await customIntegrationsApiHelper.validateConnectorCreationAuto(connectorResponse);
      }
    );

    test(
      'verify app manager can list connectors with default parameters via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30186',
        });

        const defaultResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations();
        await customIntegrationsApiHelper.validateConnectorList(defaultResponse);
      }
    );

    test(
      'verify app manager can update connector connection type via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30187',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const updateResponse = await appManagerApiFixture.customIntegrationsHelper.updateCustomIntegration(
          connectorId,
          {
            connectionType: 'user',
          }
        );

        await customIntegrationsApiHelper.validateConnectorUpdate(updateResponse);
      }
    );

    test(
      'verify app manager can update connector auth type via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30188',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const updateResponse = await appManagerApiFixture.customIntegrationsHelper.updateCustomIntegration(
          connectorId,
          {
            authType: 'basic',
            authDetails: {
              usernameLabel: 'Username',
              passwordLabel: 'Password',
              baseUrl: 'https://api.example.com',
            },
          }
        );

        await customIntegrationsApiHelper.validateConnectorUpdate(updateResponse);
      }
    );

    test(
      'verify app manager can update connector auth details via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30189',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const updateResponse = await appManagerApiFixture.customIntegrationsHelper.updateCustomIntegration(
          connectorId,
          {
            authDetails: {
              apiTokenLabel: 'Updated API Token',
              authorizationHeader: 'Bearer updated-token-67890',
              baseUrl: 'https://api.updated.com',
            },
          }
        );

        await customIntegrationsApiHelper.validateConnectorUpdate(updateResponse);
      }
    );

    test(
      'verify app manager can list custom connectors with combined filters via API',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30190',
        });

        const { connectorId, response: createResponse } =
          await appManagerApiFixture.customIntegrationsHelper.createAndValidate();
        const connectorName = createResponse.data?.name || createResponse.result?.name || '';

        await new Promise(resolve => setTimeout(resolve, 1000));

        const combinedFiltersResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          q: connectorName,
          types: 'custom',
          sort: 'name',
          order: 'asc',
          page: 1,
          limit: 50,
        });

        await customIntegrationsApiHelper.validateConnectorList(combinedFiltersResponse);
        await customIntegrationsApiHelper.validateConnectorInList(combinedFiltersResponse, connectorId);
      }
    );

    test(
      'verify API returns error when required fields are missing',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30191',
        });

        const invalidPayloads = [
          appManagerApiFixture.customIntegrationsHelper.buildInvalidConnectorPayload({ name: '' }),
          appManagerApiFixture.customIntegrationsHelper.buildInvalidConnectorPayload({ name: undefined as any }),
        ];

        for (const invalidPayload of invalidPayloads) {
          const errorResponse =
            await appManagerApiFixture.customIntegrationsHelper.attemptInvalidCreation(invalidPayload);
          ApiResponseAssertions.expectValidationError(errorResponse);
        }
      }
    );

    test(
      'verify API returns error when authDetails is missing for api-token auth type',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30192',
        });

        const invalidPayload = appManagerApiFixture.customIntegrationsHelper.buildValidConnectorPayload();
        delete invalidPayload.authDetails;
        const errorResponse =
          await appManagerApiFixture.customIntegrationsHelper.attemptInvalidCreation(invalidPayload);
        ApiResponseAssertions.expectValidationError(errorResponse);
      }
    );

    test(
      'verify API returns 404 when getting non-existent or invalid connector',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30193',
        });

        const invalidIds = ['non-existent-id-12345', 'invalid-id-12345'];

        for (const invalidId of invalidIds) {
          const errorResponse = await appManagerApiFixture.customIntegrationsHelper.attemptGetWithInvalidId(invalidId);
          ApiResponseAssertions.expectNotFound(errorResponse);
        }
      }
    );

    test(
      'verify API returns 404 when updating non-existent connector',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30194',
        });

        const nonExistentId = 'non-existent-id-12345';
        const updatePayload = { name: 'Updated Name' };
        const errorResponse = await appManagerApiFixture.customIntegrationsHelper.attemptUpdateWithInvalidId(
          nonExistentId,
          updatePayload
        );
        ApiResponseAssertions.expectNotFound(errorResponse);
      }
    );

    test(
      'verify API returns 404 when deleting already-deleted connector or with invalid ID',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30195',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        const deleteTwiceResponse = await appManagerApiFixture.customIntegrationsHelper.attemptDeleteTwice(connectorId);
        ApiResponseAssertions.expectNotFound(deleteTwiceResponse);

        const invalidId = 'invalid-id-12345';
        const deleteInvalidResponse =
          await appManagerApiFixture.customIntegrationsHelper.attemptDeleteWithInvalidId(invalidId);
        ApiResponseAssertions.expectNotFound(deleteInvalidResponse);
      }
    );

    test(
      'verify API returns 409 when creating connector with duplicate name',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30196',
        });

        const { connectorName } = await appManagerApiFixture.customIntegrationsHelper.createAndValidate();
        const errorResponse =
          await appManagerApiFixture.customIntegrationsHelper.attemptDuplicateCreation(connectorName);
        ApiResponseAssertions.expectConflict(errorResponse);
      }
    );

    test(
      'verify API returns error when creating connector with invalid base URL',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30197',
        });

        const errorResponse = await appManagerApiFixture.customIntegrationsHelper.attemptCreationWithInvalidUrl();
        ApiResponseAssertions.expectValidationError(errorResponse);
      }
    );

    test(
      'verify API returns error when creating connector with invalid redirect URI format',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30198',
        });

        const errorResponse =
          await appManagerApiFixture.customIntegrationsHelper.attemptCreationWithInvalidRedirectUri();
        ApiResponseAssertions.expectValidationError(errorResponse);
      }
    );

    test(
      'verify API returns 401 when authentication token is missing',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30199',
        });

        const tenantConfig = getTenantConfig();
        const unauthenticatedContext = await request.newContext();
        const helper = new CustomIntegrationsHelper(unauthenticatedContext, tenantConfig.apiBaseUrl);

        const payload = helper.buildValidConnectorPayload();
        const errorResponse = await helper.attemptCreationWithoutAuth(payload);
        ApiResponseAssertions.expectUnauthorized(errorResponse);

        await unauthenticatedContext.dispose();
      }
    );

    test(
      'verify API returns 401 when authentication token is invalid',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30200',
        });

        const tenantConfig = getTenantConfig();
        const invalidTokenContext = await RequestContextFactory.createContextWithHeaders({
          Cookie: 'token=invalid-token-12345; csrfid=invalid-csrfid',
          'x-smtip-csrfid': 'invalid-csrfid',
        });
        const helper = new CustomIntegrationsHelper(invalidTokenContext, tenantConfig.apiBaseUrl);

        const payload = helper.buildValidConnectorPayload();
        const errorResponse = await helper.attemptCreationWithInvalidAuth(payload, invalidTokenContext);
        ApiResponseAssertions.expectUnauthorized(errorResponse);

        await invalidTokenContext.dispose();
      }
    );
  }
);
