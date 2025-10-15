import { TestPriority } from '@core/constants/testPriority';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AudiencePage } from '@platforms/ui/pages/abacPage/acgPage/audiencePage';

test.describe(
  'audience Creation Tests',
  {
    tag: [TestPriority.P0, `@AUDIENCE`, `@audience`],
  },
  () => {
    test(
      'verify user is able to create audience with Okta attribute with All groups type under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35759'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const audienceName = TestDataGenerator.generateAudienceName('UI_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('001_Audience_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const _category_ = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // steps
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'okta',
          adGroup: 'ALL',
        });
      }
    );

    test(
      'verify user is able to create audience with Okta attribute with Okta group type under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35758'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const audienceName = TestDataGenerator.generateAudienceName('UI_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('0123_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // Create audience with basic details
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'okta',
          adGroup: 'ALL',
          operator: 'IS',
        });

        // Test IS_NOT operator via API
        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator(
          isNotAudienceName,
          category.categoryId
        );

        // Test ALL operator via API
        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator(
          allAudienceName,
          category.categoryId
        );
      }
    );

    test(
      'verify user is able to create audience with Okta attribute with built in group type with all three operators under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35757'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const audienceName = TestDataGenerator.generateAudienceName('UI_IS_NOT_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('0123_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // UI Test: Create audience with IS_NOT operator (UI will skip operator selection for ALL group)
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'okta',
          adGroup: 'BUILT_IN',
          operator: 'ALL',
        });

        // API Test: Create audience with IS operator
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator(
          isAudienceName,
          category.categoryId
        );

        // API Test: Create audience with IS_NOT operator
        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator(
          isNotAudienceName,
          category.categoryId
        );
      }
    );

    test(
      'verify user is able to create audience with AD Group attribute with All groups type under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35756'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const audienceName = TestDataGenerator.generateAudienceName('UI_AD_GROUP_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('0123_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const _category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // steps
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'ad_group',
          adGroup: 'ALL',
        });
      }
    );

    test(
      'verify user is able to create audience with Microsoft Entra ID attribute with Security group type with all three operators under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35755'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const audienceName = TestDataGenerator.generateAudienceName('UI_ENTRA_SECURITY_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('0123_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // UI Test: Create audience with IS_NOT operator (UI will select first available security group)
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'ad_group',
          adGroup: 'security',
          operator: 'IS_NOT',
        });

        // API Test: Create audience with IS operator
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator(
          isAudienceName,
          category.categoryId
        );

        // API Test: Create audience with ALL operator
        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator(
          allAudienceName,
          category.categoryId
        );
      }
    );

    test(
      'verify user is able to create audience with Microsoft Entra ID attribute with Microsoft 365 group type with all three operators under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35754'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const audienceName = TestDataGenerator.generateAudienceName('UI_ENTRA_M365_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('0123_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // UI Test: Create audience with ALL operator (UI will skip operator value for ALL)
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'ad_group',
          adGroup: 'microsoft365',
          operator: 'ALL',
        });

        // API Test: Create audience with IS operator
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator(
          isAudienceName,
          category.categoryId
        );

        // API Test: Create audience with IS_NOT operator
        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator(
          isNotAudienceName,
          category.categoryId
        );
      }
    );

    test(
      'verify user is able to create audience with Microsoft Entra ID attribute with Mail security group type with all three operators under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35753'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const audienceName = TestDataGenerator.generateAudienceName('UI_ENTRA_MAIL_SECURITY_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('0123_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // UI Test: Create audience with IS operator (UI will select first available mail security group)
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'ad_group',
          adGroup: 'mail-security',
          operator: 'IS',
        });

        // API Test: Create audience with IS_NOT operator
        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator(
          isNotAudienceName,
          category.categoryId
        );

        // API Test: Create audience with ALL operator
        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator(
          allAudienceName,
          category.categoryId
        );
      }
    );

    test(
      'verify user is able to create audience with Microsoft Entra ID attribute with Distribution group type with all three operators under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35752'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const audienceName = TestDataGenerator.generateAudienceName('UI_ENTRA_DISTRIBUTION_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('0123_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // UI Test: Create audience with IS operator (UI will select first available distribution group)
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'ad_group',
          adGroup: 'distribution',
          operator: 'IS',
        });

        // API Test: Create audience with IS_NOT operator
        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator(
          isNotAudienceName,
          category.categoryId
        );

        // API Test: Create audience with ALL operator
        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator(
          allAudienceName,
          category.categoryId
        );
      }
    );

    test(
      'verify user is able to create audience with Country attribute with all five operators under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35751'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const _audienceName = TestDataGenerator.generateAudienceName('UI_COUNTRY_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('0123_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // UI Test: Create audience with CONTAINS operator
        const containsAudienceName = TestDataGenerator.generateAudienceName('UI_CONTAINS_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: containsAudienceName,
          description,
          parentCategoryName,
          audienceType: 'country_name',
          operator: 'CONTAINS',
        });

        // UI Test: Create audience with ENDS_WITH operator
        const endsWithAudienceName = TestDataGenerator.generateAudienceName('UI_ENDS_WITH_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: endsWithAudienceName,
          description,
          parentCategoryName,
          audienceType: 'country_name',
          operator: 'ENDS_WITH',
        });

        // UI Test: Create audience with STARTS_WITH operator
        const startsWithAudienceName = TestDataGenerator.generateAudienceName('UI_STARTS_WITH_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: startsWithAudienceName,
          description,
          parentCategoryName,
          audienceType: 'country_name',
          operator: 'STARTS_WITH',
        });

        // API Test: Create audience with IS operator
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator(
          isAudienceName,
          category.categoryId
        );

        // API Test: Create audience with IS_NOT operator
        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator(
          isNotAudienceName,
          category.categoryId
        );
      }
    );

    test(
      'verify user is able to create audience with Hire date attribute with all six operators under manage audience',
      { tag: [TestPriority.P0, `@AUDIENCE`, `@audience`] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35747'],
        });
        const audiencePage = new AudiencePage(appManagerFixture.page);

        const audienceName = TestDataGenerator.generateAudienceName('UI_HIRE_DATE_');
        const description = TestDataGenerator.generateRandomString('desc-');
        const parentCategoryName = TestDataGenerator.generateCategoryName('0123_UI_Category_');

        await audiencePage.loadPage();

        // precondition: create parent category via API, then reload UI to reflect it
        const _category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        // UI Test: Create audience with ON_OR_BEFORE operator
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'ON_OR_BEFORE',
        });

        // UI Test: Create audience with ON_OR_AFTER operator
        const onOrAfterAudienceName = TestDataGenerator.generateAudienceName('UI_ON_OR_AFTER_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: onOrAfterAudienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'ON_OR_AFTER',
        });

        // UI Test: Create audience with BEFORE operator
        const beforeAudienceName = TestDataGenerator.generateAudienceName('UI_BEFORE_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: beforeAudienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'BEFORE',
        });

        // UI Test: Create audience with AFTER operator
        const afterAudienceName = TestDataGenerator.generateAudienceName('UI_AFTER_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: afterAudienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'AFTER',
        });

        // UI Test: Create audience with ON operator
        const onAudienceName = TestDataGenerator.generateAudienceName('UI_ON_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: onAudienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'ON',
        });

        // UI Test: Create audience with BETWEEN operator
        const betweenAudienceName = TestDataGenerator.generateAudienceName('UI_BETWEEN_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: betweenAudienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'BETWEEN',
        });
      }
    );
  }
);
