import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { SiteType } from '@/src/modules/content-abac/constants/siteTypeABAC';
import { ContentSuiteTags } from '@/src/modules/content-abac/constants/testTags';
import { ContentFeatureTags } from '@/src/modules/content-abac/constants/testTags';
import { contentAbacTestFixture as test } from '@/src/modules/content-abac/fixtures/contentAbacFixture';
import { SITE_CREATION_TEST_DATA } from '@/src/modules/content-abac/test-data/create-site.test-data';
import { SiteCreationPageAbac } from '@/src/modules/content-abac/ui/pages/siteCreationPageAbac';

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
    async ({ appManagerHomePage, page, siteAudienceHelper, appManagerUINavigationHelper }) => {
      tagTest(test.info(), {
        description: 'ABAC: Create Public site selecting an existing specific audience via picker',
        zephyrTestId: 'CONT-39272',
        storyId: 'CONT-33515',
      });
      await appManagerHomePage.verifyThePageIsLoaded();
      // STEP 1: Open site creation page via ABAC CreateComponent
      await appManagerUINavigationHelper.openSiteCreationForm(true, {
        stepInfo: 'Opening site creation form for content for tenant where ABAC is enabled',
      });
      const siteCreationPage = new SiteCreationPageAbac(page);

      // Verify form structure
      await siteCreationPage.assertions.verifySiteCreationFormStructure();

      // STEP 3: Setup specific audience (reuse existing or create new)
      let audienceName = await siteAudienceHelper.getAudienceName();

      // If no audience exists, create a new one
      if (!audienceName) {
        audienceName = await siteAudienceHelper.createAudienceName();
      }

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
    async ({ appManagerHomePage, page, siteAudienceHelper, appManagerUINavigationHelper }) => {
      tagTest(test.info(), {
        zephyrTestId: 'CONT-39288',
        storyId: 'CONT-33515',
      });
      await appManagerHomePage.verifyThePageIsLoaded();
      // STEP 1: Open site creation page via ABAC CreateComponent
      await appManagerUINavigationHelper.openSiteCreationForm(true, {
        stepInfo: 'Opening site creation form for content for tenant where ABAC is enabled',
      });
      const siteCreationPage = new SiteCreationPageAbac(page);

      // Verify form structure
      await siteCreationPage.assertions.verifySiteCreationFormStructure();

      // STEP 2: Setup specific audience (reuse existing or create new)
      let audienceName = await siteAudienceHelper.getAudienceName();

      // If no audience exists, create a new one
      if (!audienceName) {
        audienceName = await siteAudienceHelper.createAudienceName();
      }

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
