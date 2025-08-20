import { expect, test } from '@playwright/test';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';
import { contentAbacTestFixture as contentTest } from '@/src/modules/content-abac/fixtures/contentAbacFixture';
import { SiteCreationPage } from '@/src/modules/content-abac/pages/siteCreationPage';
import { SITE_CREATION_TEST_DATA } from '@/src/modules/content-abac/test-data/create-site.test-data';

contentTest.describe('Site Creation Test Suite (ABAC)', { tag: [ContentSuiteTags.SITE_CREATION] }, () => {
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

  for (const site of SITE_TEST_DATA) {
    contentTest(
      `Verify user is able to create a ${site.siteType} site (ABAC)`,
      { tag: [ContentSuiteTags.SITE_CREATION, TestPriority.P0, TestGroupType.REGRESSION] },
      async ({ appManagerHomePage, page }) => {
        tagTest(test.info(), {
          description: 'ABAC: Verify Target Audience and Subscriptions and create site',
          zephyrTestId: site.siteType === SiteType.PUBLIC ? 'CONT-38637' : 'CONT-37643',
          storyId: 'CONT-33515',
        });

        // STEP 1: Open site creation page via ABAC CreateComponent
        await appManagerHomePage.actions.openSiteCreationForm();
        const siteCreationPage = new SiteCreationPage(page);

        // STEP 2: Verify sections (Access, Target Audience, Subscriptions)
        await siteCreationPage.verifySiteCreationFormStructure();

        // STEP 3: Create the site and capture siteId from URL
        const siteId = await siteCreationPage.createSite({
          name: site.name,
          category: site.category,
          type: site.siteType,
        });

        // STEP 4: Verify site creation success toast and that siteId is present
        await siteCreationPage.assertions.verifySiteCreatedSuccessfully(site.name);
        await expect(siteId, 'siteId should be returned after site creation').toBeTruthy();

        // STEP 5: Deactivate the site via page methods
        await siteCreationPage.deactivateSiteViaUI();
        await siteCreationPage.verifySiteDeactivated();
      }
    );
  }
});
