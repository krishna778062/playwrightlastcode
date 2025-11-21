import { ManageSiteSetUpPage } from '../../../ui/pages/manageSiteSetUpPage';

import { NewHomePage } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { SITE_CREATION_TEST_DATA } from '@/src/modules/content/test-data/create-site.test-data';
import { AddSiteScreenPage } from '@/src/modules/content/ui/pages/addSiteScreenPage';
import { AudienceModalPage } from '@/src/modules/content/ui/pages/audienceModalPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturePage';
import { SiteCreationPageAbac } from '@/src/modules/content/ui/pages/siteCreationPageAbac';

/**
 * This test suite is used to test the site creation functionality via ABAC.
 * We will test that with UI, app manager is able to create a site with the given site type and category.
 * Then on cleanup, we will deactivate the site using app manager api client
 */

test.describe('site Creation Test Suite (ABAC)', { tag: [ContentSuiteTags.SITE_CREATION] }, () => {
  let siteId: string | undefined;
  const SITE_TEST_DATA = [
    {
      name: SITE_CREATION_TEST_DATA.PUBLIC_SITE.name,
      category: SITE_CREATION_TEST_DATA.PUBLIC_SITE.category,
      siteType: SITE_TYPES.PUBLIC,
    },
    {
      name: SITE_CREATION_TEST_DATA.PRIVATE_SITE.name,
      category: SITE_CREATION_TEST_DATA.PRIVATE_SITE.category,
      siteType: SITE_TYPES.PRIVATE,
    },
  ] as const;
  let homePage: NewHomePage;
  let manageFeaturePage: ManageFeaturesPage;
  let manageSiteSetUpPage: ManageSiteSetUpPage;
  let addSiteScreenPage: AddSiteScreenPage;
  let audienceModalPage: AudienceModalPage;

  test.beforeEach('Setting up the test environment for site creation', async ({ appManagerFixture }) => {
    await appManagerFixture.homePage.verifyThePageIsLoaded();
    homePage = new NewHomePage(appManagerFixture.page);
    manageFeaturePage = new ManageFeaturesPage(appManagerFixture.page);
    manageSiteSetUpPage = new ManageSiteSetUpPage(appManagerFixture.page, '');
    addSiteScreenPage = new AddSiteScreenPage(appManagerFixture.page);
    audienceModalPage = new AudienceModalPage(appManagerFixture.page);
  });

  test.afterEach('Site Clean up', async ({ appManagerFixture }) => {
    if (siteId) {
      await appManagerFixture.siteManagementService.deactivateSite(siteId);
    }
  });

  for (const site of SITE_TEST_DATA) {
    test(
      `Verify user is able to create a ${site.siteType} site (ABAC)`,
      { tag: [ContentSuiteTags.SITE_CREATION, TestPriority.P0, TestGroupType.REGRESSION] },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'ABAC: Verify Site visibility and Subscriptions and create site',
          zephyrTestId: site.siteType === SITE_TYPES.PUBLIC ? 'CONT-38637' : 'CONT-37643',
          storyId: 'CONT-33515',
        });

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        // STEP 1: Open site creation page via ABAC CreateComponent
        await appManagerFixture.navigationHelper.openSiteCreationForm(true, {
          stepInfo: 'Opening site creation form via ABAC',
        });
        const siteCreationPage = new SiteCreationPageAbac(appManagerFixture.page);

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

  test(
    'verify UI shows Add Site visibility section when All Org is removed',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.ADD_TARGET_AUDIENCE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify UI shows Add Site visibility section when All Org is removed',
        zephyrTestId: 'CONT-35709',
        storyId: 'CONT-35709',
      });
      await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
      await manageFeaturePage.actions.clickOnSitesCard();
      await manageSiteSetUpPage.actions.selectSite();
      await addSiteScreenPage.actions.clickOnRemoveAudienceButton();
      await addSiteScreenPage.actions.clickOnIUnderstandCheckbox();
      await addSiteScreenPage.actions.clickOnContinueButton();
      await addSiteScreenPage.actions.clickOnBrowseButton();
      await audienceModalPage.actions.verifyingAudienceModalHeading();
      await audienceModalPage.assertions.clickOnAllOrganizationOption();
      await audienceModalPage.actions.selectingAudience();
    }
  );
});
