import { integrationsFixture as test } from '@integrations/fixtures/integrationsFixture';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { expect, request } from '@playwright/test';

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
      'verify app manager can create custom connector',
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
      'verify app manager can get custom connector by ID',
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
      'verify app manager can update custom connector',
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
      'verify app manager can list custom connectors',
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
      'verify app manager can delete custom connector',
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
      'verify app manager can enable custom connector',
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
      'verify app manager can disable custom connector',
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
          zephyrTestId: 'INT-30176',
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
      'verify app manager can list custom connectors with pagination',
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
      'verify app manager can list custom connectors with different sort options',
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
      'verify app manager can search custom connectors by name',
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
      'verify app manager can list prebuilt connectors',
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
      'verify app manager can list only custom connectors',
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
      'verify app manager can get connector connections with user type',
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
      'verify app manager can update connector category',
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
      'verify app manager can create connector with different auth types',
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
      'verify app manager can create connector with different categories',
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
      'verify app manager can create connector with user connection type',
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
      'verify app manager can list connectors with default parameters',
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
      'verify app manager can update connector connection type',
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
      'verify app manager can update connector auth type',
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
      'verify app manager can update connector auth details',
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
      'verify app manager can list custom connectors with combined filters',
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

    test(
      'verify app manager can create custom connector with logo upload',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30223',
        });

        const payload = appManagerApiFixture.customIntegrationsHelper.buildValidConnectorPayload();
        const connectorResponse = await appManagerApiFixture.customIntegrationsHelper.createCustomIntegrationWithLogo(
          payload,
          'Jira_Custom_App.jpg'
        );
        await customIntegrationsApiHelper.validateConnectorCreationAuto(connectorResponse);
        ApiResponseAssertions.expectSuccess(connectorResponse);
      }
    );

    test(
      'verify app manager can create custom connector with PNG logo',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30224',
        });

        const payload = appManagerApiFixture.customIntegrationsHelper.buildValidConnectorPayload();
        const connectorResponse = await appManagerApiFixture.customIntegrationsHelper.createCustomIntegrationWithLogo(
          payload,
          'favicon.png'
        );
        await customIntegrationsApiHelper.validateConnectorCreationAuto(connectorResponse);
        ApiResponseAssertions.expectSuccess(connectorResponse);
      }
    );

    test(
      'verify app manager can update custom connector logo',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30225',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        const updateResponse = await appManagerApiFixture.customIntegrationsHelper.updateCustomIntegrationWithLogo(
          connectorId,
          {},
          'expensify.jpg'
        );
        await customIntegrationsApiHelper.validateConnectorUpdate(updateResponse);
        ApiResponseAssertions.expectSuccess(updateResponse);
      }
    );

    test(
      'verify API returns error when uploading logo with invalid file format',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30226',
        });

        const invalidFileName = 'nonexistent-file.txt';
        const errorResponse =
          await appManagerApiFixture.customIntegrationsHelper.attemptLogoUploadWithInvalidFile(invalidFileName);
        expect(errorResponse.message || errorResponse.status, 'Expected error for invalid file format').toBeTruthy();
      }
    );

    test(
      'verify app manager can list connectors filtered by prebuilt type',
      {
        tag: [TestPriority.P3, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30227',
        });

        // Test filtering by prebuilt type (hybrid)
        const prebuiltResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'hybrid',
          sort: 'name',
          order: 'asc',
          page: 1,
          limit: 50,
        });

        await customIntegrationsApiHelper.validateConnectorList(prebuiltResponse);

        // Verify all returned connectors are prebuilt (hybrid type)
        if (prebuiltResponse.data && prebuiltResponse.data.length > 0) {
          prebuiltResponse.data.forEach((connector: any) => {
            expect(['hybrid', 'prebuilt']).toContain(connector.type);
          });
        }
      }
    );

    test(
      'verify app manager can get connector connections with both app and user types',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30228',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId({
          connectionType: 'app',
        });

        const appConnectionsResponse = await appManagerApiFixture.customIntegrationsHelper.getConnectorConnections(
          connectorId,
          'app'
        );
        ApiResponseAssertions.expectSuccess(appConnectionsResponse);

        const userConnectionsResponse = await appManagerApiFixture.customIntegrationsHelper.getConnectorConnections(
          connectorId,
          'user'
        );
        ApiResponseAssertions.expectSuccess(userConnectionsResponse);
      }
    );

    test(
      'verify app manager can list connectors filtered by category',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30229',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId({
          category: 'files',
        });

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
      'verify app manager can update connector with partial fields',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30230',
        });

        const connectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const updateResponse = await appManagerApiFixture.customIntegrationsHelper.updateCustomIntegration(
          connectorId,
          {
            description: 'Updated description only',
          }
        );

        await customIntegrationsApiHelper.validateConnectorUpdate(updateResponse);
        ApiResponseAssertions.expectSuccess(updateResponse);
      }
    );

    test(
      'verify app manager can list connectors with edge case pagination',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30231',
        });

        const page0Response = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          page: 0,
          limit: 10,
        });
        await customIntegrationsApiHelper.validateConnectorList(page0Response, true);

        const largeLimitResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          page: 1,
          limit: 1000,
        });
        await customIntegrationsApiHelper.validateConnectorList(largeLimitResponse, true);
      }
    );

    test(
      'verify app manager can update connector to remove logo',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30232',
        });

        const payload = appManagerApiFixture.customIntegrationsHelper.buildValidConnectorPayload();
        const connectorWithLogo = await appManagerApiFixture.customIntegrationsHelper.createCustomIntegrationWithLogo(
          payload,
          'Jira_Custom_App.jpg'
        );
        const connectorId = appManagerApiFixture.customIntegrationsHelper.parseConnectorId(connectorWithLogo);

        if (!connectorId) {
          throw new Error('Failed to get connector ID');
        }

        const updateResponse = await appManagerApiFixture.customIntegrationsHelper.updateCustomIntegration(
          connectorId,
          {
            logoFileId: null as any,
          }
        );

        await customIntegrationsApiHelper.validateConnectorUpdate(updateResponse);
        ApiResponseAssertions.expectSuccess(updateResponse);
      }
    );

    test(
      'verify app manager can list connectors filtered by enabled status',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30233',
        });

        const enabledConnectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        await appManagerApiFixture.customIntegrationsHelper.updateConnectorStatus(enabledConnectorId, true);

        const disabledConnectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        await appManagerApiFixture.customIntegrationsHelper.updateConnectorStatus(disabledConnectorId, false);

        const listResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 100,
        });

        await customIntegrationsApiHelper.validateConnectorList(listResponse);
        await customIntegrationsApiHelper.validateConnectorInList(listResponse, enabledConnectorId);
        await customIntegrationsApiHelper.validateConnectorInList(listResponse, disabledConnectorId);
      }
    );

    test(
      'verify app manager can list connectors filtered by connection type',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30234',
        });

        const appConnectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId({
          connectionType: 'app',
        });

        const userConnectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId({
          connectionType: 'user',
        });

        const listResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 100,
        });

        await customIntegrationsApiHelper.validateConnectorList(listResponse);
        await customIntegrationsApiHelper.validateConnectorInList(listResponse, appConnectorId);
        await customIntegrationsApiHelper.validateConnectorInList(listResponse, userConnectorId);
      }
    );

    test(
      'verify app manager can list connectors filtered by disabled status',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30235',
        });

        const disabledConnectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        await appManagerApiFixture.customIntegrationsHelper.updateConnectorStatus(disabledConnectorId, false);

        const listResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 100,
        });

        await customIntegrationsApiHelper.validateConnectorList(listResponse);
        await customIntegrationsApiHelper.validateConnectorInList(listResponse, disabledConnectorId);
      }
    );

    test(
      'verify app manager can list connectors filtered by custom type only',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30236',
        });

        const customConnectorId = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const customOnlyResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom',
          sort: 'name',
          order: 'asc',
          page: 1,
          limit: 50,
        });

        await customIntegrationsApiHelper.validateConnectorList(customOnlyResponse);
        await customIntegrationsApiHelper.validateConnectorInList(customOnlyResponse, customConnectorId);
      }
    );

    test(
      'verify app manager can search connectors with no results returns empty list',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30237',
        });

        const searchResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          q: 'NonExistentConnectorName12345XYZ',
          types: 'custom,hybrid',
          limit: 100,
        });

        await customIntegrationsApiHelper.validateConnectorList(searchResponse, true);
        const listItems = customIntegrationsApiHelper.getListItems(searchResponse);
        expect(listItems.length, 'Search with non-existent name should return empty list').toBe(0);
      }
    );

    test(
      'verify app manager can list connectors with result count validation',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30238',
        });

        const connectorId1 = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        const connectorId2 = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        await new Promise(resolve => setTimeout(resolve, 1000));

        const listResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 100,
        });

        await customIntegrationsApiHelper.validateConnectorList(listResponse);
        const listItems = customIntegrationsApiHelper.getListItems(listResponse);
        expect(listItems.length, 'List should contain at least the created connectors').toBeGreaterThanOrEqual(2);
        await customIntegrationsApiHelper.validateConnectorInList(listResponse, connectorId1);
        await customIntegrationsApiHelper.validateConnectorInList(listResponse, connectorId2);
      }
    );

    test(
      'verify app manager can list connectors with pagination limit validation',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30239',
        });

        const limit5Response = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 5,
        });

        await customIntegrationsApiHelper.validateConnectorList(limit5Response);
        const listItems5 = customIntegrationsApiHelper.getListItems(limit5Response);
        expect(listItems5.length, 'List with limit 5 should have at most 5 items').toBeLessThanOrEqual(5);

        const limit10Response = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastmodified',
          order: 'desc',
          page: 1,
          limit: 10,
        });

        await customIntegrationsApiHelper.validateConnectorList(limit10Response);
        const listItems10 = customIntegrationsApiHelper.getListItems(limit10Response);
        expect(listItems10.length, 'List with limit 10 should have at most 10 items').toBeLessThanOrEqual(10);
      }
    );

    test(
      'verify app manager can list connectors with combined search and type filter',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30240',
        });

        const { connectorId, connectorName } = await appManagerApiFixture.customIntegrationsHelper.createAndValidate();

        await new Promise(resolve => setTimeout(resolve, 1000));

        const combinedResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          q: connectorName,
          types: 'custom',
          sort: 'name',
          order: 'asc',
          page: 1,
          limit: 50,
        });

        await customIntegrationsApiHelper.validateConnectorList(combinedResponse);
        await customIntegrationsApiHelper.validateConnectorInList(combinedResponse, connectorId);
      }
    );

    test(
      'verify app manager can list connectors sorted by date created ascending',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30241',
        });

        const connectorId1 = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const connectorId2 = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const sortedResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'datecreated',
          order: 'asc',
          page: 1,
          limit: 100,
        });

        await customIntegrationsApiHelper.validateConnectorList(sortedResponse);
        await customIntegrationsApiHelper.validateConnectorInList(sortedResponse, connectorId1);
        await customIntegrationsApiHelper.validateConnectorInList(sortedResponse, connectorId2);
      }
    );

    test(
      'verify app manager can list connectors sorted by date created descending',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30242',
        });

        const connectorId1 = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const connectorId2 = await appManagerApiFixture.customIntegrationsHelper.createAndGetId();

        const sortedResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'datecreated',
          order: 'desc',
          page: 1,
          limit: 100,
        });

        await customIntegrationsApiHelper.validateConnectorList(sortedResponse);
        await customIntegrationsApiHelper.validateConnectorInList(sortedResponse, connectorId1);
        await customIntegrationsApiHelper.validateConnectorInList(sortedResponse, connectorId2);
      }
    );

    test(
      'verify app manager can list connectors sorted by last used ascending',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30243',
        });

        const sortedResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastused',
          order: 'asc',
          page: 1,
          limit: 50,
        });

        await customIntegrationsApiHelper.validateConnectorList(sortedResponse);
      }
    );

    test(
      'verify app manager can list connectors sorted by last used descending',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30244',
        });

        const sortedResponse = await appManagerApiFixture.customIntegrationsHelper.listCustomIntegrations({
          types: 'custom,hybrid',
          sort: 'lastused',
          order: 'desc',
          page: 1,
          limit: 50,
        });

        await customIntegrationsApiHelper.validateConnectorList(sortedResponse);
      }
    );
  }
);
