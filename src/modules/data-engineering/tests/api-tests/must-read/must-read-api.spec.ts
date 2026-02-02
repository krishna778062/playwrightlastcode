import { expect, request } from '@playwright/test';
import fs from 'fs';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { expectValidSchema } from '@/src/modules/data-engineering/api/helpers/schemaValidationHelper';
import {
  GetMustReadCountsResponseSchema,
  GetMustReadStatusResponseSchema,
  GetMustReadUserCountResponseSchema,
  GetMustReadUserListResponseSchema,
} from '@/src/modules/data-engineering/api/schemas';
import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import { DATA_ENGINEERING_API_ENDPOINTS } from '@/src/modules/data-engineering/constants/apiEndpoints';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/analyticsFixture';
import { MustReadSql } from '@/src/modules/data-engineering/sqlQueries/mustRead';

function normalizeDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().replace('T', ' ').replace('Z', '').slice(0, 23);
  }
  return value.toString().trim();
}

function isQueryConfigured(query: string): boolean {
  const trimmed = query.trim();
  return trimmed.length > 0 && !trimmed.includes('TODO: Add must-read');
}

function getDbValue(row: Record<string, any>, key: string) {
  if (!row) return undefined;
  const direct = row[key];
  if (direct !== undefined) return direct;
  const lowerKey = key.toLowerCase();
  const matchKey = Object.keys(row).find(k => k.toLowerCase() === lowerKey);
  return matchKey ? row[matchKey] : undefined;
}

function normalizeCsvValue(value: string | null | undefined): string {
  if (!value) return '';
  return value.toString().trim();
}

function toEpochMillis(value: string | null | undefined): number | null {
  if (!value) return null;
  const raw = value.toString().trim();
  if (!raw) return null;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function writeCsvToTempFile(csvText: string, filenamePrefix: string): string {
  const root = FileUtil.getProjectRoot();
  const outputDir = FileUtil.getFilePath(root, 'test-results', 'must-read-csv');
  FileUtil.createDir(outputDir);
  const filePath = FileUtil.getFilePath(outputDir, `${filenamePrefix}-${Date.now()}.csv`);
  fs.writeFileSync(filePath, csvText, 'utf8');
  return filePath;
}

async function assertEmptyOrNotFound(response: any, label: string) {
  if (response.status() === 200) {
    try {
      const body = await response.json();
      const data = body?.data;
      const isEmpty =
        data == null ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0);
      expect.soft(isEmpty, `${label} should return empty data`).toBe(true);
    } catch {
      const text = await response.text();
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      expect.soft(lines.length <= 1, `${label} should return empty CSV`).toBe(true);
    }
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
  'must read status API tests',
  {
    tag: [DataEngineeringTestSuite.ANALYTICS, '@api-tests', '@must-read'],
  },
  () => {
    test(
      'validate must read status response schema',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-status-schema'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read status response schema',
          zephyrTestId: 'DE-28305',
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

        const validatedResponse = await analyticsApiService.getMustReadStatus(contentId);

        expect(validatedResponse.success, 'API should return success=true').toBe(true);
        expect(validatedResponse.data.content_code, 'API content_code should match request').toBe(contentId);
      }
    );

    test(
      'validate must read status negative scenarios and access control',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-status-negative'],
      },
      async ({ appManagerApiFixture }) => {
        test.fail(true, 'Known failure: DE-28337');
        tagTest(test.info(), {
          description: 'Validate must read status negative scenarios and access control',
          zephyrTestId: 'DE-28306',
          storyId: 'DE-26968',
          isKnownFailure: true,
          bugTicket: 'DE-28337',
        });

        const config = getDataEngineeringConfigFromCache();
        const endpoint = DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadStatus;
        const storageState = await appManagerApiFixture.apiContext.storageState();
        const csrfCookie = storageState.cookies.find(cookie => cookie.name === 'csrfid');
        const csrfHeader = csrfCookie?.value ?? '';

        const dbContentIds = await appManagerApiFixture.mustReadQueryHelper.getActiveMustReadContentIds();
        const contentId = dbContentIds[0]?.CODE ?? '00000000-0000-0000-0000-000000000000';

        await runNegativeScenarios({
          endpoint,
          basePayload: { contentId },
          apiBaseUrl: config.apiBaseUrl,
          storageState,
          csrfHeader,
          label: 'MustReadStatus',
        });
      }
    );

    test(
      'validate must read status business logic and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-status'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read status business logic and snowflake database match',
          zephyrTestId: 'DE-28307',
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

        const apiResponse = await analyticsApiService.getMustReadStatus(contentId);
        const validatedResponse = expectValidSchema(
          GetMustReadStatusResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        expect(validatedResponse.success, 'API should return success=true').toBe(true);
        expect(validatedResponse.data.content_code, 'API content_code should match request').toBe(contentId);

        const dbResults = await mustReadQueryHelper.getMustReadStatusByContentId(contentId);
        const dbRow = dbResults[0];

        expect(dbRow, 'Snowflake UDL should return a record for contentId').toBeTruthy();

        const apiData = validatedResponse.data;
        expect(apiData.site_name, 'API site_name should match UDL').toBe(dbRow.SITE_NAME);
        expect(apiData.is_must_read, 'API is_must_read should match UDL').toBe(dbRow.IS_MUST_READ);
        expect(apiData.was_must_read, 'API was_must_read should match UDL').toBe(dbRow.WAS_MUST_READ);
        expect(apiData.is_must_read_expired, 'API is_must_read_expired should match UDL').toBe(
          Number(dbRow.IS_MUST_READ_EXPIRED)
        );
        expect(apiData.must_read_audience_type_code, 'API audience type should match UDL').toBe(
          dbRow.MUST_READ_AUDIENCE_TYPE_CODE
        );
        expect(normalizeDate(apiData.must_read_start_datetime), 'API must_read_start_datetime should match UDL').toBe(
          normalizeDate(dbRow.MUST_READ_START_DATETIME)
        );
        expect(normalizeDate(apiData.must_read_end_datetime), 'API must_read_end_datetime should match UDL').toBe(
          normalizeDate(dbRow.MUST_READ_END_DATETIME)
        );

        // Business logic checks
        if (apiData.must_read_start_datetime && apiData.must_read_end_datetime) {
          expect(
            apiData.must_read_start_datetime <= apiData.must_read_end_datetime,
            'Start datetime should be before or equal to end datetime'
          ).toBe(true);
        }

        const expectedExpired = !apiData.is_must_read && apiData.was_must_read ? 1 : 0;
        expect(apiData.is_must_read_expired, 'is_must_read_expired should align with flags').toBe(expectedExpired);

        test.info().annotations.push({
          type: 'API Summary',
          description: `MustReadStatus: ${contentId} | is_must_read=${apiData.is_must_read} | was_must_read=${apiData.was_must_read} | is_must_read_expired=${apiData.is_must_read_expired} | start=${apiData.must_read_start_datetime ?? 'null'} | end=${apiData.must_read_end_datetime ?? 'null'} | Schema: Valid | UDL Match: OK`,
        });
      }
    );

    test(
      'validate must read counts response schema',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-counts-schema'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read counts response schema',
          zephyrTestId: 'DE-28308',
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

        const apiResponse = await analyticsApiService.getMustReadCounts(contentId);
        const validatedResponse = expectValidSchema(
          GetMustReadCountsResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        expect(validatedResponse.success, 'API should return success=true').toBe(true);
      }
    );

    test(
      'validate must read counts negative scenarios and access control',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-counts-negative'],
      },
      async ({ appManagerApiFixture }) => {
        test.fail(true, 'Known failure: DE-28337');
        tagTest(test.info(), {
          description: 'Validate must read counts negative scenarios and access control',
          zephyrTestId: 'DE-28309',
          storyId: 'DE-26968',
          isKnownFailure: true,
          bugTicket: 'DE-28337',
        });

        const config = getDataEngineeringConfigFromCache();
        const endpoint = DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadCounts;
        const storageState = await appManagerApiFixture.apiContext.storageState();
        const csrfCookie = storageState.cookies.find(cookie => cookie.name === 'csrfid');
        const csrfHeader = csrfCookie?.value ?? '';

        await runNegativeScenarios({
          endpoint,
          basePayload: { contentId: '00000000-0000-0000-0000-000000000000' },
          apiBaseUrl: config.apiBaseUrl,
          storageState,
          csrfHeader,
          label: 'MustReadCounts',
        });
      }
    );

    test(
      'validate must read counts business logic and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-counts'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read counts business logic and snowflake database match',
          zephyrTestId: 'DE-28310',
          storyId: 'DE-26968',
        });

        if (!isQueryConfigured(MustReadSql.MUST_READ_COUNTS)) {
          test.skip(true, 'Must read counts query is not configured');
        }

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

        const apiResponse = await analyticsApiService.getMustReadCounts(contentId);
        expect(apiResponse.success, 'API should return success=true').toBe(true);

        const dbResults = await mustReadQueryHelper.getMustReadCountsFromDB(contentId);
        const dbRow = dbResults[0] ?? {};
        const dbTotalUsers = getDbValue(dbRow, 'total_users');
        const dbReadUsers = getDbValue(dbRow, 'read_users');

        expect(apiResponse.data.total_users, 'API total_users should match UDL').toBe(dbTotalUsers);
        expect(apiResponse.data.read_users, 'API read_users should match UDL').toBe(dbReadUsers);
      }
    );

    test(
      'validate must read user list response schema',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-user-list-schema'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read user list response schema',
          zephyrTestId: 'DE-28311',
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

        const apiResponse = await analyticsApiService.getMustReadUserList({
          contentId,
          readStatus: 'READ',
          search: '',
          page: 1,
          limit: 25,
        });
        const validatedResponse = expectValidSchema(
          GetMustReadUserListResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        expect(validatedResponse.success, 'API should return success=true').toBe(true);
      }
    );

    test(
      'validate must read user list negative scenarios and access control',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-user-list-negative'],
      },
      async ({ appManagerApiFixture }) => {
        test.fail(true, 'Known failure: DE-28337');
        tagTest(test.info(), {
          description: 'Validate must read user list negative scenarios and access control',
          zephyrTestId: 'DE-28312',
          storyId: 'DE-26968',
          isKnownFailure: true,
          bugTicket: 'DE-28337',
        });

        const config = getDataEngineeringConfigFromCache();
        const endpoint = DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadUserList;
        const storageState = await appManagerApiFixture.apiContext.storageState();
        const csrfCookie = storageState.cookies.find(cookie => cookie.name === 'csrfid');
        const csrfHeader = csrfCookie?.value ?? '';

        await runNegativeScenarios({
          endpoint,
          basePayload: {
            contentId: '00000000-0000-0000-0000-000000000000',
            readStatus: 'READ',
            search: '',
            page: 1,
            limit: 25,
          },
          apiBaseUrl: config.apiBaseUrl,
          storageState,
          csrfHeader,
          label: 'MustReadUserList',
        });
      }
    );

    test(
      'validate must read user list business logic and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-user-list'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read user list business logic and snowflake database match',
          zephyrTestId: 'DE-28313',
          storyId: 'DE-26968',
        });

        if (!isQueryConfigured(MustReadSql.MUST_READ_USER_LIST)) {
          test.skip(true, 'Must read user list query is not configured');
        }

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

        const apiResponse = await analyticsApiService.getMustReadUserList({
          contentId,
          readStatus: 'READ',
          search: '',
          page: 1,
          limit: 25,
        });
        expect(apiResponse.success, 'API should return success=true').toBe(true);

        const dbResults = await mustReadQueryHelper.getMustReadUserListFromDB({
          contentCode: contentId,
          readStatus: 'READ',
          search: '',
          page: 1,
          limit: 25,
        });
        expect(apiResponse.data.length, 'API user count should match UDL count').toBe(dbResults.length);
      }
    );

    test(
      'validate must read user count response schema',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-user-count-schema'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read user count response schema',
          zephyrTestId: 'DE-28317',
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

        const apiResponse = await analyticsApiService.getMustReadUserCount({
          contentId,
          readStatus: 'READ',
          search: '',
        });
        const validatedResponse = expectValidSchema(
          GetMustReadUserCountResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        expect(validatedResponse.success, 'API should return success=true').toBe(true);
      }
    );

    test(
      'validate must read user count negative scenarios and access control',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-user-count-negative'],
      },
      async ({ appManagerApiFixture }) => {
        test.fail(true, 'Known failure: DE-28337');
        tagTest(test.info(), {
          description: 'Validate must read user count negative scenarios and access control',
          zephyrTestId: 'DE-28318',
          storyId: 'DE-26968',
          isKnownFailure: true,
          bugTicket: 'DE-28337',
        });

        const config = getDataEngineeringConfigFromCache();
        const endpoint = DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadUserCount;
        const storageState = await appManagerApiFixture.apiContext.storageState();
        const csrfCookie = storageState.cookies.find(cookie => cookie.name === 'csrfid');
        const csrfHeader = csrfCookie?.value ?? '';

        await runNegativeScenarios({
          endpoint,
          basePayload: { contentId: '00000000-0000-0000-0000-000000000000', readStatus: 'READ', search: '' },
          apiBaseUrl: config.apiBaseUrl,
          storageState,
          csrfHeader,
          label: 'MustReadUserCount',
        });
      }
    );

    test(
      'validate must read user count business logic and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-user-count'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read user count business logic and snowflake database match',
          zephyrTestId: 'DE-28319',
          storyId: 'DE-26968',
        });

        if (!isQueryConfigured(MustReadSql.MUST_READ_USER_COUNT)) {
          test.skip(true, 'Must read user count query is not configured');
        }

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

        const apiResponse = await analyticsApiService.getMustReadUserCount({
          contentId,
          readStatus: 'READ',
          search: '',
        });
        expect(apiResponse.success, 'API should return success=true').toBe(true);

        const dbResults = await mustReadQueryHelper.getMustReadUserCountFromDB({
          contentCode: contentId,
          readStatus: 'READ',
          search: '',
        });
        const dbRow = dbResults[0] ?? {};
        expect(apiResponse.data.user_count, 'API user_count should match UDL').toBe(getDbValue(dbRow, 'user_count'));
      }
    );

    test(
      'validate must read users csv response schema',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-users-csv-schema'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read users CSV response schema',
          zephyrTestId: 'DE-28320',
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

        const csvResponse = await analyticsApiService.getMustReadUsersCsv(contentId);
        const csvPath = writeCsvToTempFile(csvResponse, 'must-read-users');
        const headers = CSVUtils.getHeadersFromReportCSV(csvPath);
        expect(headers, 'CSV header should match expected columns').toEqual([
          'User name',
          'Email',
          'Status',
          'Time',
          'Manager name',
          'City',
          'State',
          'Country',
          'Department',
          'Company Name',
          'Division',
          'Job title',
        ]);
      }
    );

    test(
      'validate must read users csv negative scenarios and access control',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-users-csv-negative'],
      },
      async ({ appManagerApiFixture }) => {
        test.fail(true, 'Known failure: DE-28337');
        tagTest(test.info(), {
          description: 'Validate must read users csv negative scenarios and access control',
          zephyrTestId: 'DE-28321',
          storyId: 'DE-26968',
          isKnownFailure: true,
          bugTicket: 'DE-28337',
        });

        const config = getDataEngineeringConfigFromCache();
        const endpoint = DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadUsersCsv;
        const storageState = await appManagerApiFixture.apiContext.storageState();
        const csrfCookie = storageState.cookies.find(cookie => cookie.name === 'csrfid');
        const csrfHeader = csrfCookie?.value ?? '';

        await runNegativeScenarios({
          endpoint,
          basePayload: { contentId: '00000000-0000-0000-0000-000000000000' },
          apiBaseUrl: config.apiBaseUrl,
          storageState,
          csrfHeader,
          label: 'MustReadUsersCsv',
        });
      }
    );

    test(
      'validate must read users csv business logic and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@must-read-users-csv'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate must read users CSV business logic and snowflake database match',
          zephyrTestId: 'DE-28322',
          storyId: 'DE-26968',
        });

        if (!isQueryConfigured(MustReadSql.MUST_READ_USERS_CSV)) {
          test.skip(true, 'Must read users CSV query is not configured');
        }

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

        const csvResponse = await analyticsApiService.getMustReadUsersCsv(contentId);
        const dbResults = await mustReadQueryHelper.getMustReadUsersCsvFromDB(contentId);
        expect(csvResponse.trim().length > 0, 'CSV response should not be empty').toBe(true);

        const csvPath = writeCsvToTempFile(csvResponse, 'must-read-users');
        const headers = CSVUtils.getHeadersFromReportCSV(csvPath);
        const rows = CSVUtils.getDataRecordsFromReportCSV(csvPath);
        const expectedHeaders = [
          'User name',
          'Email',
          'Status',
          'Time',
          'Manager name',
          'City',
          'State',
          'Country',
          'Department',
          'Company Name',
          'Division',
          'Job title',
        ];
        expect(headers, 'CSV header should match expected columns').toEqual(expectedHeaders);

        const dbMap = new Map(dbResults.map(row => [normalizeCsvValue(getDbValue(row, 'EMAIL')), row]));
        const csvMap = new Map(rows.map(row => [normalizeCsvValue(row['Email'] as string), row]));

        expect(rows.length, 'CSV row count should match UDL count').toBe(dbResults.length);

        csvMap.forEach((row, email) => {
          const userName = normalizeCsvValue(row['User name'] as string);
          const status = normalizeCsvValue(row['Status'] as string);
          const time = normalizeCsvValue(row['Time'] as string);
          const managerName = normalizeCsvValue(row['Manager name'] as string);
          const city = normalizeCsvValue(row['City'] as string);
          const state = normalizeCsvValue(row['State'] as string);
          const country = normalizeCsvValue(row['Country'] as string);
          const department = normalizeCsvValue(row['Department'] as string);
          const companyName = normalizeCsvValue(row['Company Name'] as string);
          const division = normalizeCsvValue(row['Division'] as string);
          const jobTitle = normalizeCsvValue(row['Job title'] as string);

          const dbRow = dbMap.get(email);
          expect(dbRow, `UDL row should exist for email ${email}`).toBeTruthy();

          expect(userName, `User name should match for ${email}`).toBe(
            normalizeCsvValue(getDbValue(dbRow, 'USER_NAME'))
          );
          expect(status, `Status should match for ${email}`).toBe(normalizeCsvValue(getDbValue(dbRow, 'READ_STATUS')));
          expect(managerName, `Manager name should match for ${email}`).toBe(
            normalizeCsvValue(getDbValue(dbRow, 'MANAGER_NAME'))
          );
          expect(city, `City should match for ${email}`).toBe(normalizeCsvValue(getDbValue(dbRow, 'CITY')));
          expect(state, `State should match for ${email}`).toBe(normalizeCsvValue(getDbValue(dbRow, 'STATE')));
          expect(country, `Country should match for ${email}`).toBe(normalizeCsvValue(getDbValue(dbRow, 'COUNTRY')));
          expect(department, `Department should match for ${email}`).toBe(
            normalizeCsvValue(getDbValue(dbRow, 'DEPARTMENT'))
          );
          expect(companyName, `Company name should match for ${email}`).toBe(
            normalizeCsvValue(getDbValue(dbRow, 'COMPANY_NAME'))
          );
          expect(division, `Division should match for ${email}`).toBe(normalizeCsvValue(getDbValue(dbRow, 'DIVISION')));
          expect(jobTitle, `Job title should match for ${email}`).toBe(normalizeCsvValue(getDbValue(dbRow, 'TITLE')));

          const apiTime = toEpochMillis(time);
          const dbTime = toEpochMillis(normalizeCsvValue(getDbValue(dbRow, 'CONFIRMATION_DATETIME')));
          expect(apiTime, `Confirmation datetime should match for ${email}`).toBe(dbTime);
        });
      }
    );
  }
);
