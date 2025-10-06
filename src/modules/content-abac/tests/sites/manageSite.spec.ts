import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentAbacTestFixture as test } from '@/src/modules/content-abac/fixtures/contentAbacFixture';
import { EditAudienceGroupModalPage } from '@/src/modules/content-abac/pages/editAudienceGroupModalPage';
import { ManageFeaturesPage } from '@/src/modules/content-abac/pages/manageFeaturePage';
import { ManageSitePage } from '@/src/modules/content-abac/pages/manageSitePage';
import { SiteDetailsPage } from '@/src/modules/content-abac/pages/siteDetailsPage';

test.describe('Manage Site Test Suite (ABAC)', { tag: [ContentSuiteTags.MANAGE_SITE] }, () => {
  let homePage: NewUxHomePage;
  let manageFeaturePage: ManageFeaturesPage;
  let manageSitePage: ManageSitePage;
  let siteDetailsPage: SiteDetailsPage;
  let editAudienceGroupModalPage: EditAudienceGroupModalPage;

  test.beforeEach('Setting up the test environment for site creation', async ({ appManagerHomePage }) => {
    await appManagerHomePage.verifyThePageIsLoaded();

    homePage = new NewUxHomePage(appManagerHomePage.page);
    manageFeaturePage = new ManageFeaturesPage(appManagerHomePage.page);
    manageSitePage = new ManageSitePage(appManagerHomePage.page, '');
    siteDetailsPage = new SiteDetailsPage(appManagerHomePage.page, '');
    editAudienceGroupModalPage = new EditAudienceGroupModalPage(appManagerHomePage.page, '');
  });

  test.afterEach('Site Clean up', async ({ siteManagementService }) => {});

  test(
    'Verify Warning Message Appears After Changing Target Audience',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.CONT_38912],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        description: 'Verify Warning Message Appears After Changing Target Audience',
        zephyrTestId: 'CONT-38912',
        storyId: 'CONT-38912',
      });
      await homePage.actions.clickOnManageFeature();
      await manageFeaturePage.actions.clickOnSitesCard();
      await manageSitePage.actions.selectSite();
      await siteDetailsPage.actions.removingAudienceGroup();
      await editAudienceGroupModalPage.actions.clickingOnIUnderstandCheckbox();
      await editAudienceGroupModalPage.actions.clickingOnContinueButton();
      await siteDetailsPage.assertions.verifyWarningMessage();
    }
  );
});
