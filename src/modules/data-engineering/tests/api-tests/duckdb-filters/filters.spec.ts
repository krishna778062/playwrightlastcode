import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/analyticsFixture';

test.describe(
  'duckDB powered filters API tests',
  {
    tag: [DataEngineeringTestSuite.DUCKDB_POWERED_FILTERS, '@api-tests', '@duckdb-filters'],
  },
  () => {
    test(
      'validate segments API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@segments'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate segments API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26533',
        });

        const { analyticsApiService, duckdbFiltersQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveSegments();
        const responseTime = Date.now() - startTime;

        expect(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);
        expect(apiResponse.success, 'API should return success=true').toBe(true);
        expect(apiResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(apiResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(apiResponse.metadata.count, 'Metadata count should match data array length').toBe(
          apiResponse.data.length
        );

        const dbResults = await duckdbFiltersQueryHelper.getActiveSegmentsFromDB();

        expect(apiResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const dbMap = new Map(dbResults.map((s: any) => [s.SEGMENT_CODE, s.SEGMENT_NAME]));
        apiResponse.data.forEach(seg => {
          expect(dbMap.has(seg.segment_code), `Segment ${seg.segment_code} should exist in Snowflake UDL`).toBe(true);
          expect(seg.segment_name, `Segment name for ${seg.segment_code} should match UDL`).toBe(
            dbMap.get(seg.segment_code)
          );
        });

        console.log(`✅ Segments: ${apiResponse.data.length} | Response: ${responseTime}ms | UDL Match: OK`);
      }
    );

    test(
      'validate departments API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@departments'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate departments API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26534',
        });

        const { analyticsApiService, duckdbFiltersQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveDepartments();
        const responseTime = Date.now() - startTime;

        expect(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);
        expect(apiResponse.success, 'API should return success=true').toBe(true);
        expect(apiResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(apiResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(apiResponse.metadata.count, 'Metadata count should match data array length').toBe(
          apiResponse.data.length
        );

        const dbResults = await duckdbFiltersQueryHelper.getActiveDepartmentsFromDB();

        expect(apiResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const apiDepts = new Set(apiResponse.data.map((d: any) => d.department));
        const dbDepts = new Set(dbResults.map((d: any) => d.DEPARTMENT));

        apiDepts.forEach((dept: string) => {
          expect(dbDepts.has(dept), `Department "${dept}" from API should exist in Snowflake UDL`).toBe(true);
        });

        dbDepts.forEach((dept: string) => {
          expect(apiDepts.has(dept), `Department "${dept}" from UDL should exist in API response`).toBe(true);
        });

        console.log(`✅ Departments: ${apiResponse.data.length} | Response: ${responseTime}ms | UDL Match: OK`);
      }
    );

    test(
      'validate locations API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@locations'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate locations API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26535',
        });

        const { analyticsApiService, duckdbFiltersQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveLocations();
        const responseTime = Date.now() - startTime;

        expect(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);
        expect(apiResponse.success, 'API should return success=true').toBe(true);
        expect(apiResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(apiResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(apiResponse.metadata.count, 'Metadata count should match data array length').toBe(
          apiResponse.data.length
        );

        const dbResults = await duckdbFiltersQueryHelper.getActiveLocationsFromDB();

        expect(apiResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const apiLocations = new Set(apiResponse.data.map((d: any) => d.location));
        const dbLocations = new Set(dbResults.map((d: any) => d.LOCATION));

        apiLocations.forEach((location: string) => {
          expect(dbLocations.has(location), `Location "${location}" from API should exist in Snowflake UDL`).toBe(true);
        });

        dbLocations.forEach((location: string) => {
          expect(apiLocations.has(location), `Location "${location}" from UDL should exist in API response`).toBe(true);
        });

        console.log(`✅ Locations: ${apiResponse.data.length} | Response: ${responseTime}ms | UDL Match: OK`);
      }
    );

    test(
      'validate user categories API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@user-categories'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate user categories API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26536',
        });

        const { analyticsApiService, duckdbFiltersQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveUserCategories();
        const responseTime = Date.now() - startTime;

        expect(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);
        expect(apiResponse.success, 'API should return success=true').toBe(true);
        expect(apiResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(apiResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(apiResponse.metadata.count, 'Metadata count should match data array length').toBe(
          apiResponse.data.length
        );

        const dbResults = await duckdbFiltersQueryHelper.getActiveUserCategoriesFromDB();

        expect(apiResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const dbMap = new Map(dbResults.map((s: any) => [s.USER_CATEGORY_CODE, s.USER_CATEGORY_NAME]));
        apiResponse.data.forEach(cat => {
          expect(
            dbMap.has(cat.user_category_code),
            `User category ${cat.user_category_code} should exist in Snowflake UDL`
          ).toBe(true);
          expect(cat.user_category_name, `User category name for ${cat.user_category_code} should match UDL`).toBe(
            dbMap.get(cat.user_category_code)
          );
        });

        console.log(`✅ User Categories: ${apiResponse.data.length} | Response: ${responseTime}ms | UDL Match: OK`);
      }
    );

    test(
      'validate company names API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@company-names'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate company names API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26537',
        });

        const { analyticsApiService, duckdbFiltersQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveCompanyNames();
        const responseTime = Date.now() - startTime;

        expect(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);
        expect(apiResponse.success, 'API should return success=true').toBe(true);
        expect(apiResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(apiResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(apiResponse.metadata.count, 'Metadata count should match data array length').toBe(
          apiResponse.data.length
        );

        const dbResults = await duckdbFiltersQueryHelper.getActiveCompanyNamesFromDB();

        expect(apiResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const apiCompanyNames = new Set(apiResponse.data.map((d: any) => d.company_name));
        const dbCompanyNames = new Set(dbResults.map((d: any) => d.COMPANY_NAME));

        apiCompanyNames.forEach((name: string) => {
          expect(dbCompanyNames.has(name), `Company name "${name}" from API should exist in Snowflake UDL`).toBe(true);
        });

        dbCompanyNames.forEach((name: string) => {
          expect(apiCompanyNames.has(name), `Company name "${name}" from UDL should exist in API response`).toBe(true);
        });

        console.log(`✅ Company Names: ${apiResponse.data.length} | Response: ${responseTime}ms | UDL Match: OK`);
      }
    );

    test(
      'validate divisions API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@divisions'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate divisions API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26538',
        });

        const { analyticsApiService, duckdbFiltersQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getActiveDivisions();
        const responseTime = Date.now() - startTime;

        expect(responseTime, 'API response time should be under 1 second').toBeLessThan(1000);
        expect(apiResponse.success, 'API should return success=true').toBe(true);
        expect(apiResponse.metadata.status, 'Metadata status should match request').toBe('active');
        expect(apiResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(apiResponse.metadata.count, 'Metadata count should match data array length').toBe(
          apiResponse.data.length
        );

        const dbResults = await duckdbFiltersQueryHelper.getActiveDivisionsFromDB();

        expect(apiResponse.data.length, 'API data count should match Snowflake UDL count').toBe(dbResults.length);

        const apiDivisions = new Set(apiResponse.data.map((d: any) => d.division));
        const dbDivisions = new Set(dbResults.map((d: any) => d.DIVISION));

        apiDivisions.forEach((division: string) => {
          expect(dbDivisions.has(division), `Division "${division}" from API should exist in Snowflake UDL`).toBe(true);
        });

        dbDivisions.forEach((division: string) => {
          expect(apiDivisions.has(division), `Division "${division}" from UDL should exist in API response`).toBe(true);
        });

        console.log(`✅ Divisions: ${apiResponse.data.length} | Response: ${responseTime}ms | UDL Match: OK`);
      }
    );
  }
);
