import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { expectValidSchema } from '@/src/modules/data-engineering/api/helpers/schemaValidationHelper';
import {
  GetBatchRunDetailsResponseSchema,
  GetCompanyNamesResponseSchema,
  GetDepartmentsResponseSchema,
  GetDivisionsResponseSchema,
  GetLocationsResponseSchema,
  GetSegmentsResponseSchema,
  GetUserCategoriesResponseSchema,
} from '@/src/modules/data-engineering/api/schemas';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/analyticsFixture';

test.describe(
  'analytics API tests',
  {
    tag: [DataEngineeringTestSuite.ANALYTICS, '@api-tests', '@analytics-api'],
  },
  () => {
    test(
      'validate segments API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@segments', '@duckdb-powered-filters'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate segments API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26533',
        });

        const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveSegments();
        const responseTime = Date.now() - startTime;

        expect.soft(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);

        // Validate response schema using Zod
        const validatedResponse = expectValidSchema(
          GetSegmentsResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        // Validate business logic
        expect(validatedResponse.success, 'API should return success=true').toBe(true);
        expect(validatedResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(validatedResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(validatedResponse.metadata.count, 'Metadata count should match data array length').toBe(
          validatedResponse.data.length
        );

        const dbResults = await analyticsQueryHelper.getActiveSegmentsFromDB();

        expect(validatedResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const dbMap = new Map(dbResults.map((s: any) => [s.SEGMENT_CODE, s.SEGMENT_NAME]));
        validatedResponse.data.forEach(seg => {
          expect(dbMap.has(seg.segment_code), `Segment ${seg.segment_code} should exist in Snowflake UDL`).toBe(true);
          expect(seg.segment_name, `Segment name for ${seg.segment_code} should match UDL`).toBe(
            dbMap.get(seg.segment_code)
          );
        });

        test.info().annotations.push({
          type: 'API Summary',
          description: `Segments: ${validatedResponse.data.length} | Response: ${responseTime}ms | Schema: Valid | UDL Match: OK`,
        });
      }
    );

    test(
      'validate departments API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@departments', '@duckdb-powered-filters'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate departments API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26534',
        });

        const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveDepartments();
        const responseTime = Date.now() - startTime;

        expect.soft(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);

        // Validate response schema using Zod
        const validatedResponse = expectValidSchema(
          GetDepartmentsResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        // Validate business logic
        expect(validatedResponse.success, 'API should return success=true').toBe(true);
        expect(validatedResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(validatedResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(validatedResponse.metadata.count, 'Metadata count should match data array length').toBe(
          validatedResponse.data.length
        );

        const dbResults = await analyticsQueryHelper.getActiveDepartmentsFromDB();

        expect(validatedResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const apiDepts = new Set(validatedResponse.data.map(d => d.department));
        const dbDepts = new Set(dbResults.map((d: any) => d.DEPARTMENT));

        apiDepts.forEach((dept: string) => {
          expect(dbDepts.has(dept), `Department "${dept}" from API should exist in Snowflake UDL`).toBe(true);
        });

        dbDepts.forEach((dept: string) => {
          expect(apiDepts.has(dept), `Department "${dept}" from UDL should exist in API response`).toBe(true);
        });

        test.info().annotations.push({
          type: 'API Summary',
          description: `Departments: ${validatedResponse.data.length} | Response: ${responseTime}ms | Schema: Valid | UDL Match: OK`,
        });
      }
    );

    test(
      'validate locations API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@locations', '@duckdb-powered-filters'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate locations API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26535',
        });

        const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveLocations();
        const responseTime = Date.now() - startTime;

        expect.soft(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);

        // Validate response schema using Zod
        const validatedResponse = expectValidSchema(
          GetLocationsResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        // Validate business logic
        expect(validatedResponse.success, 'API should return success=true').toBe(true);
        expect(validatedResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(validatedResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(validatedResponse.metadata.count, 'Metadata count should match data array length').toBe(
          validatedResponse.data.length
        );

        const dbResults = await analyticsQueryHelper.getActiveLocationsFromDB();

        expect(validatedResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const apiLocations = new Set(validatedResponse.data.map(d => d.location));
        const dbLocations = new Set(dbResults.map((d: any) => d.LOCATION));

        apiLocations.forEach((location: string) => {
          expect(dbLocations.has(location), `Location "${location}" from API should exist in Snowflake UDL`).toBe(true);
        });

        dbLocations.forEach((location: string) => {
          expect(apiLocations.has(location), `Location "${location}" from UDL should exist in API response`).toBe(true);
        });

        test.info().annotations.push({
          type: 'API Summary',
          description: `Locations: ${validatedResponse.data.length} | Response: ${responseTime}ms | Schema: Valid | UDL Match: OK`,
        });
      }
    );

    test(
      'validate user categories API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@user-categories', '@duckdb-powered-filters'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate user categories API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26536',
        });

        const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveUserCategories();
        const responseTime = Date.now() - startTime;

        expect.soft(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);

        // Validate response schema using Zod
        const validatedResponse = expectValidSchema(
          GetUserCategoriesResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        // Validate business logic
        expect(validatedResponse.success, 'API should return success=true').toBe(true);
        expect(validatedResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(validatedResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(validatedResponse.metadata.count, 'Metadata count should match data array length').toBe(
          validatedResponse.data.length
        );

        const dbResults = await analyticsQueryHelper.getActiveUserCategoriesFromDB();

        expect(validatedResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const dbMap = new Map(dbResults.map((s: any) => [s.USER_CATEGORY_CODE, s.USER_CATEGORY_NAME]));
        validatedResponse.data.forEach(cat => {
          expect(
            dbMap.has(cat.user_category_code),
            `User category ${cat.user_category_code} should exist in Snowflake UDL`
          ).toBe(true);
          expect(cat.user_category_name, `User category name for ${cat.user_category_code} should match UDL`).toBe(
            dbMap.get(cat.user_category_code)
          );
        });

        test.info().annotations.push({
          type: 'API Summary',
          description: `User Categories: ${validatedResponse.data.length} | Response: ${responseTime}ms | Schema: Valid | UDL Match: OK`,
        });
      }
    );

    test(
      'validate company names API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@company-names', '@duckdb-powered-filters'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate company names API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26537',
        });

        const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveCompanyNames();
        const responseTime = Date.now() - startTime;

        expect.soft(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);

        // Validate response schema using Zod
        const validatedResponse = expectValidSchema(
          GetCompanyNamesResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        // Validate business logic
        expect(validatedResponse.success, 'API should return success=true').toBe(true);
        expect(validatedResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(validatedResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(validatedResponse.metadata.count, 'Metadata count should match data array length').toBe(
          validatedResponse.data.length
        );

        const dbResults = await analyticsQueryHelper.getActiveCompanyNamesFromDB();

        expect(validatedResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const apiCompanyNames = new Set(validatedResponse.data.map(d => d.company_name));
        const dbCompanyNames = new Set(dbResults.map((d: any) => d.COMPANY_NAME));

        apiCompanyNames.forEach((name: string) => {
          expect(dbCompanyNames.has(name), `Company name "${name}" from API should exist in Snowflake UDL`).toBe(true);
        });

        dbCompanyNames.forEach((name: string) => {
          expect(apiCompanyNames.has(name), `Company name "${name}" from UDL should exist in API response`).toBe(true);
        });

        test.info().annotations.push({
          type: 'API Summary',
          description: `Company Names: ${validatedResponse.data.length} | Response: ${responseTime}ms | Schema: Valid | UDL Match: OK`,
        });
      }
    );

    test(
      'validate divisions API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@divisions', '@duckdb-powered-filters'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate divisions API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26538',
        });

        const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveDivisions();
        const responseTime = Date.now() - startTime;

        expect.soft(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);

        // Validate response schema using Zod
        const validatedResponse = expectValidSchema(
          GetDivisionsResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        // Validate business logic
        expect(validatedResponse.success, 'API should return success=true').toBe(true);
        expect(validatedResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(validatedResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(validatedResponse.metadata.count, 'Metadata count should match data array length').toBe(
          validatedResponse.data.length
        );

        const dbResults = await analyticsQueryHelper.getActiveDivisionsFromDB();

        expect(validatedResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const apiDivisions = new Set(validatedResponse.data.map(d => d.division));
        const dbDivisions = new Set(dbResults.map((d: any) => d.DIVISION));

        apiDivisions.forEach((division: string) => {
          expect(dbDivisions.has(division), `Division "${division}" from API should exist in Snowflake UDL`).toBe(true);
        });

        dbDivisions.forEach((division: string) => {
          expect(apiDivisions.has(division), `Division "${division}" from UDL should exist in API response`).toBe(true);
        });

        test.info().annotations.push({
          type: 'API Summary',
          description: `Divisions: ${validatedResponse.data.length} | Response: ${responseTime}ms | Schema: Valid | UDL Match: OK`,
        });
      }
    );

    test(
      'validate batch run details API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@batch-run-details'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate batch run details API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26539',
        });

        const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getBatchRunDetails();
        const responseTime = Date.now() - startTime;

        expect.soft(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);

        // Validate response schema using Zod
        const validatedResponse = expectValidSchema(
          GetBatchRunDetailsResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        // Validate business logic
        expect(validatedResponse.success, 'API should return success=true').toBe(true);
        expect(validatedResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(validatedResponse.metadata.count, 'Metadata count should match data array length').toBe(
          validatedResponse.data.length
        );

        const dbResults = await analyticsQueryHelper.getBatchRunDetailsFromDB();

        expect(validatedResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const dbMap = new Map(dbResults.map((b: any) => [b.BATCH_NAME, b.LAST_BATCH_END_TIME]));
        validatedResponse.data.forEach(batch => {
          expect(dbMap.has(batch.batch_name), `Batch ${batch.batch_name} should exist in Snowflake UDL`).toBe(true);

          // Normalize timestamps to 'YYYY-MM-DD HH:mm:ss.SSS' format
          const apiTime = batch.latest_process_end_time.replace('T', ' ').replace('Z', '').trim();

          const dbTimeRaw = dbMap.get(batch.batch_name);
          // Convert Snowflake timestamp object to string using toJSON() method
          const dbTime =
            typeof dbTimeRaw === 'object' && dbTimeRaw.toJSON
              ? dbTimeRaw.toJSON().replace('T', ' ').replace('Z', '').trim()
              : String(dbTimeRaw).trim();

          expect(
            apiTime,
            `Latest process end time for ${batch.batch_name} should match UDL (API: ${apiTime}, DB: ${dbTime})`
          ).toBe(dbTime);
        });

        test.info().annotations.push({
          type: 'API Summary',
          description: `Batch Run Details: ${validatedResponse.data.length} | Response: ${responseTime}ms | Schema: Valid | UDL Match: OK`,
        });
      }
    );
  }
);
