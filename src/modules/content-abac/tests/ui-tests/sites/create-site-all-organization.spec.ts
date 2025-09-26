import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { SiteType } from '@/src/modules/content-abac/constants/siteTypeABAC';
import { contentAbacTestFixture as test } from '@/src/modules/content-abac/fixtures/contentAbacFixture';
import { SITE_CREATION_TEST_DATA } from '@/src/modules/content-abac/test-data/create-site.test-data';
import { SiteCreationPage } from '@/src/modules/content-abac/ui/pages/siteCreationPage';

/**
 * This test suite is used to test the site creation functionality via ABAC.
 * We will test that with UI, app manager is able to create a site with the given site type and category.
 * Then on cleanup, we will deactivate the site using app manager api client
 */

test.describe('Site Creation Test Suite (ABAC)', { tag: [ContentSuiteTags.SITE_CREATION] }, () => {
  let siteId: string | undefined;
  const SITE_TEST_DATA = [
    {
      name: SITE_CREATION_TEST_DATA.PUBLIC_SITE.name,
      category: SITE_CREATION_TEST_DATA.PUBLIC_SITE.category,
      siteType: SiteType.PUBLIC,
    },
    {
      name: SITE_CREATION_TEST_DATA.PRIVATE_SITE.name,
      category: SITE_CREATION_TEST_DATA.PRIVATE_SITE.category,
      siteType: SiteType.PRIVATE,
    },
  ] as const;

  test.afterEach('Site Clean up', async ({ siteManagementService }) => {
    if (siteId) {
      await siteManagementService.deactivateSite(siteId);
    }
  });

  for (const site of SITE_TEST_DATA) {
    test(
      `Verify user is able to create a ${site.siteType} site (ABAC)`,
      { tag: [ContentSuiteTags.SITE_CREATION, TestPriority.P0, TestGroupType.REGRESSION] },
      async ({ appManagerHomePage, appManagerPage }) => {
        tagTest(test.info(), {
          description: 'ABAC: Verify Target Audience and Subscriptions and create site',
          zephyrTestId: site.siteType === SiteType.PUBLIC ? 'CONT-38637' : 'CONT-37643',
          storyId: 'CONT-33515',
        });

        // STEP 1: Open site creation page via ABAC CreateComponent
        await appManagerHomePage.actions.openSiteCreationForm();
        const siteCreationPage = new SiteCreationPage(appManagerPage);

        // STEP 2: Verify site creation form structure and elements
        await siteCreationPage.assertions.verifySiteCreationFormStructure();

        // STEP 3: Create the site and capture siteId from URL
        siteId = await siteCreationPage.createSite({
          name: site.name,
          category: site.category,
          type: site.siteType,
        });
        console.log('INFO: The created siteId', siteId);

        // STEP 4: Verify site creation success toast and that siteId is present
        await siteCreationPage.assertions.verifySiteCreatedSuccessfully(site.name);
      }
    );
  }
});
