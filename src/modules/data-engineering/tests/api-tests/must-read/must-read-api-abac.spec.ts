import { expect, request } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { expectValidSchema } from '@/src/modules/data-engineering/api/helpers/schemaValidationHelper';
import { GetMustReadAudienceListResponseSchema } from '@/src/modules/data-engineering/api/schemas';
import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import { DATA_ENGINEERING_API_ENDPOINTS } from '@/src/modules/data-engineering/constants/apiEndpoints';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/analyticsFixture';

async function assertEmptyOrNotFound(response: any, label: string) {
  if (response.status() === 200) {
    const body = await response.json();
    const data = body?.data;
    const isEmpty = data == null || (Array.isArray(data) && data.length === 0);
    expect.soft(isEmpty, `${label} should return empty data`).toBe(true);
  } else {
    expect.soft([404], `${label} should return 404 or empty data`).toContain(response.status());
  }
}

async function runNegativeScenarios(params: {
  endpoint: string;
  basePayload: Record<string, any>;
  apiBaseUrl: string;
  storageState: any;
  csrfHeader: string;
  label: string;
}) {
  const { endpoint, basePayload, apiBaseUrl, storageState, csrfHeader, label } = params;

  const unauthContext = await request.newContext({ baseURL: apiBaseUrl });
  const invalidCookieContext = await request.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: {
      cookie: 'token=invalid; csrfid=invalid',
    },
  });
  const authContext = await request.newContext({
    baseURL: apiBaseUrl,
    storageState,
  });

  try {
    const noCookieResponse = await unauthContext.post(endpoint, {
      data: basePayload,
    });
    expect.soft([401, 403], `${label} without cookies should return 401/403`).toContain(noCookieResponse.status());

    const invalidCookieResponse = await invalidCookieContext.post(endpoint, {
      data: basePayload,
      headers: { 'x-smtip-csrfid': 'invalid', 'content-type': 'application/json' },
    });
    expect.soft([401, 403], `${label} invalid cookies should return 401/403`).toContain(invalidCookieResponse.status());

    const invalidCsrfResponse = await authContext.post(endpoint, {
      data: basePayload,
      headers: { 'x-smtip-csrfid': 'invalid', 'content-type': 'application/json' },
    });
    expect.soft([401, 403], `${label} invalid CSRF should return 401/403`).toContain(invalidCsrfResponse.status());

    const malformedResponse = await authContext.post(endpoint, {
      data: { ...basePayload, contentId: 'not-a-uuid' },
      headers: { 'x-smtip-csrfid': csrfHeader, 'content-type': 'application/json' },
    });
    expect.soft(malformedResponse.status(), `${label} malformed contentId should return 400`).toBe(400);

    const nonExistentResponse = await authContext.post(endpoint, {
      data: { ...basePayload, contentId: '00000000-0000-0000-0000-000000000000' },
      headers: { 'x-smtip-csrfid': csrfHeader, 'content-type': 'application/json' },
    });
    await assertEmptyOrNotFound(nonExistentResponse, `${label} non-existent contentId`);
  } finally {
    await unauthContext.dispose();
    await invalidCookieContext.dispose();
    await authContext.dispose();
  }
}

test.describe(
  'must read audience list API ABAC tests',
  {
    tag: [DataEngineeringTestSuite.ANALYTICS, '@api-tests', '@must-read', '@abac'],
  },
  () => {
    test(
      'validate must read audience list response schema',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-audience-list-schema'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read audience list response schema (ABAC)',
          zephyrTestId: 'DE-28314',
          storyId: 'DE-26968',
        });

        const { analyticsApiService, mustReadQueryHelper } = appManagerApiFixture;
        const tenantCode = getDataEngineeringConfigFromCache().orgId;
        const dbContentIds = await mustReadQueryHelper.getActiveMustReadContentIds();
        const contentId = dbContentIds[0]?.CODE;

        if (!contentId) {
          test.info().annotations.push({
            type: 'Skip Reason',
            description: `No must-read content found for tenant ${tenantCode}`,
          });
          test.skip(true, `No must-read content found for tenant ${tenantCode}`);
        }

        const apiResponse = await analyticsApiService.getMustReadAudienceList(contentId);
        const validatedResponse = expectValidSchema(
          GetMustReadAudienceListResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        expect(validatedResponse.success, 'API should return success=true').toBe(true);
      }
    );

    test(
      'validate must read audience list business logic and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-audience-list'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read audience list business logic and snowflake database match (ABAC)',
          zephyrTestId: 'DE-28316',
          storyId: 'DE-26968',
        });

        const { analyticsApiService, mustReadQueryHelper } = appManagerApiFixture;
        const tenantCode = getDataEngineeringConfigFromCache().orgId;
        const dbContentIds = await mustReadQueryHelper.getActiveMustReadContentIds();
        const contentId = dbContentIds[0]?.CODE;

        if (!contentId) {
          test.info().annotations.push({
            type: 'Skip Reason',
            description: `No must-read content found for tenant ${tenantCode}`,
          });
          test.skip(true, `No must-read content found for tenant ${tenantCode}`);
        }

        const apiResponse = await analyticsApiService.getMustReadAudienceList(contentId);
        expect(apiResponse.success, 'API should return success=true').toBe(true);

        const dbResults = await mustReadQueryHelper.getMustReadAudienceListFromDB(contentId);
        expect(apiResponse.data.length, 'API audience count should match UDL count').toBe(dbResults.length);
      }
    );

    test(
      'validate must read audience list negative scenarios and access control',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-audience-list-negative'],
      },
      async ({ appManagerApiFixture }) => {
        test.fail(true, 'Known failure: DE-28337');
        tagTest(test.info(), {
          description: 'Validate must read audience list negative scenarios and access control (ABAC)',
          zephyrTestId: 'DE-28315',
          storyId: 'DE-26968',
          isKnownFailure: true,
          bugTicket: 'DE-28337',
        });

        const config = getDataEngineeringConfigFromCache();
        const endpoint = DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadAudienceList;
        const storageState = await appManagerApiFixture.apiContext.storageState();
        const csrfCookie = storageState.cookies.find(cookie => cookie.name === 'csrfid');
        const csrfHeader = csrfCookie?.value ?? '';

        await runNegativeScenarios({
          endpoint,
          basePayload: { contentId: '00000000-0000-0000-0000-000000000000', page: 1 },
          apiBaseUrl: config.apiBaseUrl,
          storageState,
          csrfHeader,
          label: 'MustReadAudienceList',
        });
      }
    );
  }
);
