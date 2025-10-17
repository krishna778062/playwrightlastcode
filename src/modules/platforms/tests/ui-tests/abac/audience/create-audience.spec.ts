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

        const _category_ = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

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

        await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'okta',
          adGroup: 'ALL',
          operator: 'IS',
        });
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

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'okta',
          adGroup: 'BUILT_IN',
          operator: 'ALL',
        });

        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator(
          isAudienceName,
          category.categoryId,
          'BUILT_IN',
          await appManagerFixture.audienceTestDataHelper.getOktaBuiltInGroupId(),
          'oktaGroup'
        );

        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator(
          isNotAudienceName,
          category.categoryId,
          'BUILT_IN',
          await appManagerFixture.audienceTestDataHelper.getOktaBuiltInGroupId(),
          'oktaGroup'
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

        await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

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

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'ad_group',
          adGroup: 'security',
          operator: 'IS_NOT',
        });

        const securityGroupId = await appManagerFixture.audienceTestDataHelper.getSecurityGroupId();
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator(
          isAudienceName,
          category.categoryId,
          'security',
          securityGroupId,
          'adGroup'
        );

        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator(
          allAudienceName,
          category.categoryId,
          'security',
          securityGroupId,
          'adGroup'
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

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'ad_group',
          adGroup: 'microsoft365',
          operator: 'ALL',
        });

        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator(
          isAudienceName,
          category.categoryId,
          'microsoft365',
          await appManagerFixture.audienceTestDataHelper.getMicrosoft365GroupId(),
          'adGroup'
        );

        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator(
          isNotAudienceName,
          category.categoryId,
          'microsoft365',
          await appManagerFixture.audienceTestDataHelper.getMicrosoft365GroupId(),
          'adGroup'
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

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'ad_group',
          adGroup: 'mail-security',
          operator: 'IS',
        });

        const mailSecurityGroupId = await appManagerFixture.audienceTestDataHelper.getMailSecurityGroupId();

        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator(
          allAudienceName,
          category.categoryId,
          'mail-security',
          mailSecurityGroupId,
          'adGroup'
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

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'ad_group',
          adGroup: 'distribution',
          operator: 'IS',
        });

        const distributionGroupId = await appManagerFixture.audienceTestDataHelper.getDistributionGroupId();
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator(
          isAudienceName,
          category.categoryId,
          'distribution',
          distributionGroupId,
          'adGroup'
        );

        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator(
          allAudienceName,
          category.categoryId,
          'distribution',
          distributionGroupId,
          'adGroup'
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

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });

        const containsAudienceName = TestDataGenerator.generateAudienceName('UI_CONTAINS_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: containsAudienceName,
          description,
          parentCategoryName,
          audienceType: 'country_name',
          operator: 'CONTAINS',
        });

        const endsWithAudienceName = TestDataGenerator.generateAudienceName('UI_ENDS_WITH_');
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: endsWithAudienceName,
          description,
          parentCategoryName,
          audienceType: 'country_name',
          operator: 'ENDS_WITH',
        });

        const startsWithAudienceName = TestDataGenerator.generateAudienceName('UI_STARTS_WITH_');
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: startsWithAudienceName,
          description,
          parentCategoryName,
          audienceType: 'country_name',
          operator: 'STARTS_WITH',
        });

        const countryValue = await appManagerFixture.audienceTestDataHelper.getCountryValue();
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator(
          isAudienceName,
          category.categoryId,
          'country_name',
          countryValue,
          'regular'
        );

        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator(
          isNotAudienceName,
          category.categoryId,
          'country_name',
          countryValue,
          'regular'
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

        await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'ON_OR_BEFORE',
        });

        const onOrAfterAudienceName = TestDataGenerator.generateAudienceName('UI_ON_OR_AFTER_');
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: onOrAfterAudienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'ON_OR_AFTER',
        });

        const beforeAudienceName = TestDataGenerator.generateAudienceName('UI_BEFORE_');
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: beforeAudienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'BEFORE',
        });

        const afterAudienceName = TestDataGenerator.generateAudienceName('UI_AFTER_');
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: afterAudienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'AFTER',
        });

        const onAudienceName = TestDataGenerator.generateAudienceName('UI_ON_');
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: onAudienceName,
          description,
          parentCategoryName,
          audienceType: 'start_date',
          operator: 'ON',
        });

        const betweenAudienceName = TestDataGenerator.generateAudienceName('UI_BETWEEN_');
        await audiencePage.loadPage();
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
