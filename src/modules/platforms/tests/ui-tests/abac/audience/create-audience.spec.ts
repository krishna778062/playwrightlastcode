import { TestPriority } from '@core/constants/testPriority';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';
import {
  AD_GROUP_TYPES,
  AUDIENCE_TYPES,
  FIELD_TYPES,
  OPERATORS,
  PAGE_STATES,
  TEST_DATA_PREFIXES,
} from '@platforms/constants';
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

        const audienceName = TestDataGenerator.generateAudienceName(TEST_DATA_PREFIXES.UI_AUDIENCE);
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        const _category_ = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.OKTA,
          adGroup: AD_GROUP_TYPES.ALL,
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

        const audienceName = TestDataGenerator.generateAudienceName(TEST_DATA_PREFIXES.UI_AUDIENCE);
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.OKTA,
          adGroup: AD_GROUP_TYPES.ALL,
          operator: OPERATORS.IS,
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
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.OKTA,
          adGroup: 'BUILT_IN',
          operator: OPERATORS.ALL,
        });

        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator({
          audienceName: isAudienceName,
          categoryId: category.categoryId,
          attribute: AD_GROUP_TYPES.BUILT_IN,
          value: await appManagerFixture.audienceTestDataHelper.getOktaBuiltInGroupId(),
          fieldType: FIELD_TYPES.OKTA_GROUP,
        });

        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator({
          audienceName: isNotAudienceName,
          categoryId: category.categoryId,
          attribute: AD_GROUP_TYPES.BUILT_IN,
          value: await appManagerFixture.audienceTestDataHelper.getOktaBuiltInGroupId(),
          fieldType: FIELD_TYPES.OKTA_GROUP,
        });
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
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.AD_GROUP,
          adGroup: AD_GROUP_TYPES.ALL,
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
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.AD_GROUP,
          adGroup: 'security',
          operator: OPERATORS.IS_NOT,
        });

        const securityGroupId = await appManagerFixture.audienceTestDataHelper.getSecurityGroupId();
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator({
          audienceName: isAudienceName,
          categoryId: category.categoryId,
          attribute: AD_GROUP_TYPES.SECURITY,
          value: securityGroupId,
          fieldType: FIELD_TYPES.AD_GROUP,
        });

        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator({
          audienceName: allAudienceName,
          categoryId: category.categoryId,
          attribute: AD_GROUP_TYPES.SECURITY,
          value: securityGroupId,
          fieldType: FIELD_TYPES.AD_GROUP,
        });
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
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.AD_GROUP,
          adGroup: 'microsoft365',
          operator: OPERATORS.ALL,
        });

        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator({
          audienceName: isAudienceName,
          categoryId: category.categoryId,
          attribute: AD_GROUP_TYPES.MICROSOFT365,
          value: await appManagerFixture.audienceTestDataHelper.getMicrosoft365GroupId(),
          fieldType: FIELD_TYPES.AD_GROUP,
        });

        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator({
          audienceName: isNotAudienceName,
          categoryId: category.categoryId,
          attribute: AD_GROUP_TYPES.MICROSOFT365,
          value: await appManagerFixture.audienceTestDataHelper.getMicrosoft365GroupId(),
          fieldType: FIELD_TYPES.AD_GROUP,
        });
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
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.AD_GROUP,
          adGroup: 'mail-security',
          operator: OPERATORS.IS,
        });

        const mailSecurityGroupId = await appManagerFixture.audienceTestDataHelper.getMailSecurityGroupId();

        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator({
          audienceName: allAudienceName,
          categoryId: category.categoryId,
          attribute: AD_GROUP_TYPES.MAIL_SECURITY_DASH,
          value: mailSecurityGroupId,
          fieldType: FIELD_TYPES.AD_GROUP,
        });
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
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });

        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.AD_GROUP,
          adGroup: 'distribution',
          operator: OPERATORS.IS,
        });

        const distributionGroupId = await appManagerFixture.audienceTestDataHelper.getDistributionGroupId();
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator({
          audienceName: isAudienceName,
          categoryId: category.categoryId,
          attribute: AD_GROUP_TYPES.DISTRIBUTION,
          value: distributionGroupId,
          fieldType: FIELD_TYPES.AD_GROUP,
        });

        const allAudienceName = TestDataGenerator.generateAudienceName('API_ALL_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithAllOperator({
          audienceName: allAudienceName,
          categoryId: category.categoryId,
          attribute: AD_GROUP_TYPES.DISTRIBUTION,
          value: distributionGroupId,
          fieldType: FIELD_TYPES.AD_GROUP,
        });
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
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        const category = await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });

        const containsAudienceName = TestDataGenerator.generateAudienceName('UI_CONTAINS_');
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: containsAudienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.COUNTRY_NAME,
          operator: OPERATORS.CONTAINS,
        });

        const endsWithAudienceName = TestDataGenerator.generateAudienceName('UI_ENDS_WITH_');
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: endsWithAudienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.COUNTRY_NAME,
          operator: OPERATORS.ENDS_WITH,
        });

        const startsWithAudienceName = TestDataGenerator.generateAudienceName('UI_STARTS_WITH_');
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: startsWithAudienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.COUNTRY_NAME,
          operator: OPERATORS.STARTS_WITH,
        });

        const countryValue = await appManagerFixture.audienceTestDataHelper.getCountryValue();
        const isAudienceName = TestDataGenerator.generateAudienceName('API_IS_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsOperator({
          audienceName: isAudienceName,
          categoryId: category.categoryId,
          attribute: AUDIENCE_TYPES.COUNTRY_NAME,
          value: countryValue,
          fieldType: FIELD_TYPES.REGULAR,
        });

        const isNotAudienceName = TestDataGenerator.generateAudienceName('API_IS_NOT_');
        await appManagerFixture.audienceCategoryManagementHelper.createAudienceWithIsNotOperator({
          audienceName: isNotAudienceName,
          categoryId: category.categoryId,
          attribute: AUDIENCE_TYPES.COUNTRY_NAME,
          value: countryValue,
          fieldType: FIELD_TYPES.REGULAR,
        });
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

        const audienceName = TestDataGenerator.generateAudienceName(TEST_DATA_PREFIXES.UI_AUDIENCE);
        const description = TestDataGenerator.generateRandomString(TEST_DATA_PREFIXES.DESCRIPTION);
        const parentCategoryName = TestDataGenerator.generateCategoryName(TEST_DATA_PREFIXES.API_CATEGORY);

        await audiencePage.loadPage();

        await appManagerFixture.audienceCategoryManagementHelper.createCategory(parentCategoryName, {
          description: 'Parent category for audience create UI flow',
        });
        await appManagerFixture.page.reload({ waitUntil: PAGE_STATES.DOMCONTENTLOADED });
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: audienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.START_DATE,
          operator: OPERATORS.ON_OR_BEFORE,
        });

        const onOrAfterAudienceName = TestDataGenerator.generateAudienceName(TEST_DATA_PREFIXES.UI_AUDIENCE);
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: onOrAfterAudienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.START_DATE,
          operator: OPERATORS.ON_OR_AFTER,
        });

        const beforeAudienceName = TestDataGenerator.generateAudienceName(TEST_DATA_PREFIXES.UI_AUDIENCE);
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: beforeAudienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.START_DATE,
          operator: OPERATORS.BEFORE,
        });

        const afterAudienceName = TestDataGenerator.generateAudienceName(TEST_DATA_PREFIXES.UI_AUDIENCE);
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: afterAudienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.START_DATE,
          operator: OPERATORS.AFTER,
        });

        const onAudienceName = TestDataGenerator.generateAudienceName(TEST_DATA_PREFIXES.UI_AUDIENCE);
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: onAudienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.START_DATE,
          operator: OPERATORS.ON,
        });

        const betweenAudienceName = TestDataGenerator.generateAudienceName(TEST_DATA_PREFIXES.UI_AUDIENCE);
        await audiencePage.loadPage();
        await audiencePage.openCreateAudienceForm();
        await audiencePage.createAudienceWithDetails({
          name: betweenAudienceName,
          description,
          parentCategoryName,
          audienceType: AUDIENCE_TYPES.START_DATE,
          operator: OPERATORS.BETWEEN,
        });
      }
    );
  }
);
