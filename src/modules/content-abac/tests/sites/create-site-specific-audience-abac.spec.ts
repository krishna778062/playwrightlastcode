import { IdentityService } from '@/src/core/api/services/IdentityService';
import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { tagTest } from '@/src/core/utils/testDecorator';
import { SiteType } from '@/src/modules/content-abac/constants/siteTypeABAC';
import { ContentSuiteTags } from '@/src/modules/content-abac/constants/testTags';
import { ContentFeatureTags } from '@/src/modules/content-abac/constants/testTags';
import { contentAbacTestFixture as test } from '@/src/modules/content-abac/fixtures/contentAbacFixture';
import { SiteCreationPage } from '@/src/modules/content-abac/pages/siteCreationPage';
import { SITE_CREATION_TEST_DATA } from '@/src/modules/content-abac/test-data/create-site.test-data';

test.describe('Site Creation by Application Manager', { tag: [ContentFeatureTags.ADD_SITE] }, () => {
  let siteId: string | undefined;

  test.afterEach('Site Clean up', async ({ siteManagementService }) => {
    if (siteId) {
      await siteManagementService.deactivateSite(siteId);
    }
  });

  test(
    `Verify user is able to create a PUBLIC site with a specific audience (ABAC)`,
    {
      tag: [ContentSuiteTags.CREATE_SITE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerHomePage, page, appManagerApiClient }) => {
      tagTest(test.info(), {
        description: 'ABAC: Create Public site selecting an existing specific audience via picker',
        zephyrTestId: 'CONT-39272',
        storyId: 'CONT-33515',
      });

      // STEP 1: Open site creation page via ABAC CreateComponent
      await appManagerHomePage.actions.openSiteCreationForm();
      const siteCreationPage = new SiteCreationPage(page);

      // Verify form structure
      await siteCreationPage.assertions.verifySiteCreationFormStructure();

      // STEP 3: Setup specific audience (reuse existing or create new)
      const identity = new IdentityService(appManagerApiClient.context, getEnvConfig().apiBaseUrl);
      const audienceName = await siteCreationPage.getOrCreateAudienceName(identity);
      console.log(`Audience name is ${audienceName}`);

      // STEP 4: Create the site with specific audience and capture siteId from URL
      siteId = await siteCreationPage.createSite({
        name: SITE_CREATION_TEST_DATA.PUBLIC_SITE.name,
        category: SITE_CREATION_TEST_DATA.PUBLIC_SITE.category,
        type: SiteType.PUBLIC,
        audienceName: audienceName,
      });
      console.log('INFO: The created siteId', siteId);

      // STEP 6: Verify site creation success toast and that siteId is present
      await siteCreationPage.assertions.verifySiteCreatedSuccessfully(SITE_CREATION_TEST_DATA.PUBLIC_SITE.name);
    }
  );

  test(
    `Verify user is able to create a PRIVATE site with a specific audience`,
    {
      tag: [ContentSuiteTags.CREATE_SITE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerHomePage, page, appManagerApiClient }) => {
      tagTest(test.info(), {
        zephyrTestId: 'CONT-39288',
        storyId: 'CONT-33515',
      });

      // STEP 1: Open site creation page via ABAC CreateComponent
      await appManagerHomePage.actions.openSiteCreationForm();
      const siteCreationPage = new SiteCreationPage(page);

      // Verify form structure
      await siteCreationPage.assertions.verifySiteCreationFormStructure();

      // STEP 2: Setup specific audience (reuse existing or create new)
      const identity = new IdentityService(appManagerApiClient.context, getEnvConfig().apiBaseUrl);
      const audienceName = await siteCreationPage.getOrCreateAudienceName(identity);
      console.log(`Audience name is ${audienceName}`);

      // STEP 3: Create the site with specific audience and capture siteId from URL
      siteId = await siteCreationPage.createSite({
        name: SITE_CREATION_TEST_DATA.PRIVATE_SITE.name,
        category: SITE_CREATION_TEST_DATA.PRIVATE_SITE.category,
        type: SiteType.PRIVATE,
        audienceName: audienceName,
      });
      console.log('INFO: The created siteId', siteId);

      // STEP 6: Verify site creation success toast and that siteId is present
      await siteCreationPage.assertions.verifySiteCreatedSuccessfully(SITE_CREATION_TEST_DATA.PRIVATE_SITE.name);
    }
  );
});
